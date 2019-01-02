const superagent = require('superagent');

const Command = require('../../../structures/Command.js');

const Cache = require('../../../../lib/structures/Cache');

const cache = new Cache('spacex-rockets');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'spacex.rockets');

		let rockets = await cache.get('res');
		if (!rockets) {
			({ body: rockets } = await superagent.get('https://api.spacexdata.com/v3/rockets'));

			// cache for 120s
			await cache.set('res', rockets, 120);
		}

		let page = 1;
		if (args.length) {
			const rocket = this.Atlas.lib.utils.nbsFuzzy(rockets, ['rocket_name', 'rocket_id'], args.join(' '));

			if (rocket) {
				page = rockets.findIndex(r => r.id === rocket.id) + 1;
			}
		}

		// todo: use first arg to search for a launch

		return responder.paginate({
			user: msg.author.id,
			total: rockets.length,
			page,
		}, (paginator) => {
			const item = rockets[paginator.page.current - 1];

			if (!item) {
				return;
			}

			const embed = {
				title: item.rocket_name,
				url: item.wikipedia,
				description: item.description,
				fields: [{
					name: 'First Flight',
					value: this.Atlas.lib.utils.timeFormat(new Date(item.first_flight)),
					inline: true,
				}, {
					name: 'Success Rate',
					value: `${item.success_rate_pct}%`,
					inline: true,
				}, {
					name: 'Cost Per Launch',
					value: `USD$ ${item.cost_per_launch.toLocaleString()}`,
					inline: true,
				}, {
					name: 'Height',
					value: `${item.height.meters} meters`,
					inline: true,
				}, {
					name: 'Diameter',
					value: `${item.diameter.meters} meters`,
					inline: true,
				}, {
					name: 'Weight',
					value: `${item.mass.kg.toLocaleString()} kg`,
					inline: true,
				}, {
					name: 'Payload Weights',
					value: item.payload_weights.map(pw => `${pw.kg.toLocaleString()} kg to ${pw.name} (${pw.id})`).join('\n'),
				}, {
					name: 'Engines',
					value: `${item.engines.number}x ${this.Atlas.lib.utils.capitalize(item.engines.type)} ${item.engines.version} engines`,
					inline: true,
				}],
				image: {
					url: item.flickr_images.shift(),
				},
				footer: {
					text: `Rocket ${paginator.page.current}/${paginator.page.total}`,
				},
			};

			if (item.engines.engine_loss_max) {
				embed.fields.push({
					name: 'Maximum Engine Loss',
					value: item.engines.engine_loss_max.toLocaleString(),
					inline: true,
				});
			}

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'rockets',
	aliases: ['rocket'],
	examples: [
		'falcon 9',
		'falcon heavy',
		'',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
