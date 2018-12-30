// handles running actions that are on an interval
const Settings = require('./structures/Settings');
const Action = require('./structures/Action');

const UPDATE_INTERVAL = 27500;
const CHECK_INTERVAL = 2500;

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;

		this.actions = [];
	}

	async start() {
		console.log('Starting interval action loop');

		setInterval(() => {
			this.check();
		}, CHECK_INTERVAL);

		setInterval(async () => {
			this.update();
		}, UPDATE_INTERVAL);

		// immediately do checks/update
		await this.check();
		this.update();
	}

	async update() {
		this.actions = await this.Atlas.DB.Action
			.aggregate([
				{
					$match: {
						'trigger.type': 'interval',
						'flags.enabled': true,
						guild: {
							$in: this.Atlas.client.guilds.map(g => g.id),
						},
						// $or: [
						// 	{ nextRunAt: null },
						// 	{ nextRunAt: {
						// 		$lte: new Date(),
						// 	} },
						// ],
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
	}

	async check() {
		const { actions } = this;

		for (const rawAction of actions.filter(a => a.flags.enabled && (Date.now() > a.nextRunAt))) {
			try {
				const guild = this.Atlas.client.guilds.get(rawAction.guild);

				const updatedBy = guild.members.get(rawAction.updatedBy);
				const validChannel = rawAction.content.find(sa => guild.channels.has(sa.channel));

				// might just be a temporary issue
				if (!guild) {
					return;
				}

				// disable any invalid actions
				// note: if actions are being randomly disabled, this is probably the cause
				if (isNaN(rawAction.trigger.content) || !updatedBy || !validChannel) {
					rawAction.enabled = false;

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
				if (this.Atlas.Raven) {
					this.Atlas.Raven.captureException(e);
				}

				console.warn(e);
			}

			const nextRunAt = +rawAction.trigger.content + Date.now();

			await this.Atlas.DB.Action.updateOne({
				_id: rawAction._id,
			}, {
				nextRunAt,
			});

			rawAction.nextRunAt = nextRunAt;
		}
	}
};
