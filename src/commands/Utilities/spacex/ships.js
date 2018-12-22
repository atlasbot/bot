const superagent = require('superagent');

const Command = require('../../../structures/Command.js');
const Cache = require('../../../../lib/structures/Cache');

const cache = new Cache('spacex-ships');

const MAX_MISSIONS = 2;

module.exports = class Ships extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'spacex.ships');

		let ships = await cache.get('res');
		if (!ships) {
			({ body: ships } = await superagent.get('https://api.spacexdata.com/v3/ships'));

			// cache for 120s
			await cache.set('res', ships, 120);
		}

		// bring most used ships to the top
		ships.sort((a, b) => b.attempted_landings - a.attempted_landings);

		let page = 1;
		if (args.length) {
			const ship = this.Atlas.lib.utils.nbsFuzzy(ships, ['ship_name', 'ship_id', 'ship_type', 'ship_model', 'ship_roles'], args.join(' '));

			if (ship) {
				page = ships.findIndex(r => r.ship_id === ship.ship_id) + 1;
			}
		}

		// todo: use first arg to search for a launch

		return responder.paginate({
			user: msg.author.id,
			total: ships.length,
			page,
		}, (paginator) => {
			const item = ships[paginator.page.current - 1];

			if (!item) {
				return;
			}

			let missions = `• ${item.missions.slice(0, MAX_MISSIONS).map(({ name }) => name).join('\n• ')}`;
			if (item.missions.length > MAX_MISSIONS) {
				missions += `\n*+ ${item.missions.length - MAX_MISSIONS} more*`;
			}

			return {
				title: `${item.ship_name} (${item.ship_id})`,
				url: item.url,
				image: {
					url: item.image,
				},
				fields: [{
					name: 'Built',
					value: item.year_built,
					inline: true,
				}, {
					name: 'Home Port',
					value: item.home_port,
					inline: true,
				}, {
					name: 'Type',
					value: item.ship_type,
					inline: true,
				}, {
					name: 'Roles',
					value: item.roles.join('\n'),
					inline: true,
				}, {
					name: 'In Use',
					value: item.active,
					inline: true,
				}, {
					name: 'Attempted Landings',
					value: item.attempted_landings,
					inline: true,
				}, {
					name: 'Successful Landings',
					value: item.successful_landings,
					inline: true,
				}, {
					name: 'Missions',
					value: missions,
					inline: true,
				}],
				footer: {
					text: `Ship ${paginator.page.current}/${paginator.page.total}`,
				},
			};
		}).send();
	}
};

module.exports.info = {
	name: 'ships',
	aliases: ['ship'],
	examples: [
		'of course i still love you',
		'OCISLY',
		'just read the instructions',
		'',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
