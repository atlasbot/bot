const superagent = require('superagent');

const Command = require('../../../structures/Command.js');
const Cache = require('../../../../lib/structures/Cache');

const cache = new Cache('spacex-dragons');

module.exports = class Dragons extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'spacex.dragons');

		let dragons = await cache.get('res');
		if (!dragons) {
			({ body: dragons } = await superagent.get('https://api.spacexdata.com/v3/dragons'));

			// cache for 120s
			await cache.set('res', dragons, 120);
		}

		// bring latest dragons to the top
		dragons.sort((a, b) => b.first_flight > a.first_flight);

		let page = 1;
		if (args.length) {
			const ship = this.Atlas.lib.utils.nbsFuzzy(dragons, ['id', 'name'], args.join(' '));

			if (ship) {
				page = dragons.findIndex(r => r.ship_id === ship.ship_id) + 1;
			}
		}

		// todo: use first arg to search for a launch

		return responder.paginate({
			user: msg.author.id,
			total: dragons.length,
			// there are so few dragons that it's kinda meh lol
			startAndEndSkip: false,
			page,
		}, (paginator) => {
			const item = dragons[paginator.page.current - 1];

			if (!item) {
				return;
			}

			return {
				title: item.name,
				url: item.wikipedia,
				description: item.description,
				image: {
					url: item.flickr_images.shift(),
				},
				fields: [{
					name: 'Thrusters',
					value: item.thrusters.map(t => `${t.amount}x ${t.type}`).join('\n'),
					inline: true,
				}, {
					name: 'Heat Shield',
					value: `${item.heat_shield.material} to ${item.heat_shield.temp_degrees.toLocaleString()} degrees`,
					inline: true,
				}, {
					name: 'Crew Capacity',
					value: item.crew_capacity,
					inline: true,
				}, {
					name: 'Launch Payload Mass',
					value: `${item.launch_payload_mass.kg.toLocaleString()} kg`,
					inline: true,
				}, {
					name: 'Return Payload Mass',
					value: `${item.return_payload_mass.kg.toLocaleString()} kg`,
					inline: true,
				}, {
					name: 'Orbit Duration',
					value: `${item.orbit_duration_yr} years`,
					inline: true,
				}],
				timestamp: new Date(item.first_flight),
				footer: {
					text: `Dragon ${paginator.page.current}/${paginator.page.total} • First flight`,
				},
			};
		}).send();
	}
};

module.exports.info = {
	name: 'dragons',
	aliases: ['dragon'],
	examples: [
		'dragon 2',
		'',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
