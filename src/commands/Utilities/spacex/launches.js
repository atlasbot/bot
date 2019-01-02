const superagent = require('superagent');

const Command = require('../../../structures/Command.js');

const Cache = require('../../../../lib/structures/Cache');

const cache = new Cache('spacex-launches');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'spacex.launches');

		let launches = await cache.get('res');
		if (!launches) {
			({ body: launches } = await superagent.get('https://api.spacexdata.com/v3/launches'));

			// cache for 120s
			await cache.set('res', launches, 120);
		}

		launches.sort((a, b) => b.launch_date_unix - a.launch_date_unix);

		let page = launches.findIndex(l => l.launch_date_unix * 1000 < (Date.now() + 8.64e+7)) + 1;
		if (args.length) {
			const launch = this.Atlas.lib.utils.nbsFuzzy(launches, ['mission_name', 'flight_number'], args.join(' '));

			if (launch) {
				page = launches.findIndex(l => l.flight_number === launch.flight_number) + 1;
			}
		}

		// todo: use first arg to search for a launch

		return responder.paginate({
			user: msg.author.id,
			total: launches.length,
			page,
		}, (paginator) => {
			const item = launches[paginator.page.current - 1];

			if (!item) {
				return;
			}

			const embed = {
				title: `${item.mission_name} - Flight ${item.flight_number}`,
				url: item.article_link,
				description: item.details,
				timestamp: new Date(item.launch_date_utc),
				thumbnail: {
					url: item.links.mission_patch_small,
				},
				fields: [{
					name: 'Launch Site',
					value: item.launch_site.site_name_long,
				}],
				image: {
					url: item.links.flickr_images[0],
				},
				footer: {
					text: `Launch ${paginator.page.current}/${paginator.page.total} • Launch date`,
				},
			};

			if (typeof item.launch_success === 'boolean' && item.launch_failure_details) {
				embed.fields.push({
					name: 'Failure Reason',
					value: this.Atlas.lib.utils.capitalize(item.launch_failure_details.reason),
					inline: true,
				});
			}

			if (item.rocket.second_stage.payloads.length) {
				const { payloads } = item.rocket.second_stage;

				embed.fields.push({
					name: 'Payloads',
					value: `• ${payloads.map((payload) => {
						let data = `${payload.payload_id} - `;

						if (payload.payload_type) {
							data += `a ${payload.payload_type.toLowerCase()} `;
						}

						if (payload.manufacturer) {
							data += `developed by ${payload.manufacturer} `;
						}

						if (payload.customers.length) {
							data += `for ${payload.customers.join(', ')} `;
						}

						if (payload.orbit) {
							data += `going to ${payload.orbit}`;
						}

						return `${data.trim()}.`;
					}).join('\n• ')}`,
				});
			}

			embed.fields.push({
				name: 'Rocket',
				value: item.rocket.rocket_name,
				inline: true,
			});

			if (item.telemetry.flight_club) {
				embed.fields.push({
					name: 'Telemetry',
					value: `[Click here](${item.telemetry.flight_club})`,
					inline: true,
				});
			}

			if (item.links.video_link) {
				embed.fields.push({
					name: item.upcoming ? 'Stream' : 'Video',
					value: `[Watch ${item.mission_name} here](${item.links.video_link})`,
					inline: true,
				});
			}

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'launches',
	aliases: ['launch'],
	examples: [
		'crs-16',
		'demosat',
		'',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
