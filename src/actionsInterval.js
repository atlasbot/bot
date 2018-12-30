// handles running actions that are on an interval
const Settings = require('./structures/Settings');
const Action = require('./structures/Action');

const CHECK_INTERVAL = 30000;

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	start() {
		console.log('Starting interval action loop');
		this.check();

		setInterval(() => {
			this.check();
		}, CHECK_INTERVAL);
	}

	async check() {
		const actions = await this.Atlas.DB.Action
			.aggregate([
				{
					$match: {
						'trigger.type': 'interval',
						guild: {
							$in: this.Atlas.client.guilds.map(g => g.id),
						},
						$or: [
							{ nextRunAt: null },
							{ nextRunAt: {
								$lte: new Date(),
							} },
						],
					// 'flags.enabled': true,
					},
				},
				{
					$lookup: {
						from: 'settings',
						localField: 'guild',
						foreignField: 'id',
						as: 'settings',
					},
				},
				{
					$unwind: '$settings',
				},
			]);

		for (const rawAction of actions) {
			try {
				const guild = this.Atlas.client.guilds.get(rawAction.guild);

				const updatedBy = guild.members.get(rawAction.updatedBy);
				const validChannel = rawAction.content.find(sa => guild.channels.has(sa.channel));

				// disable any invalid actions
				// note: if actions are being randomly disabled, this may be the cause - eris doesn't fetch all members for larger guilds cus discord
				if (!guild || isNaN(rawAction.trigger.content) || !updatedBy || !validChannel) {
					await this.Atlas.DB.Action.updateOne({
						_id: rawAction._id,
					}, {
						'flags.enabled': false,
					});

					continue;
				}

				const settings = new Settings(rawAction.settings);
				// we're in bois
				const action = new Action(settings, rawAction);

				const channel = guild.channels.get(validChannel.channel);

				// execute it with a pseudo message which should work in most cases.
				await action.execute({
					timestamp: Date.now(),
					lang: settings.lang,
					prefix: settings.prefix,
					author: updatedBy.user,
					member: updatedBy,
					channel,
					guild,
				});
			} catch (e) {
				console.warn(e);
			}

			await this.Atlas.DB.Action.updateOne({
				_id: rawAction._id,
			}, {
				nextRunAt: +rawAction.trigger.content + Date.now(),
			});
		}
	}
};
