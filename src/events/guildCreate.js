const cache = require('../cache');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild) {
		// generate settings for the guild
		const settings = await this.Atlas.DB.settings(guild);

		if (!settings.raw.bot) {
			await settings.update({
				$set: {
					bot: true,
				},
			});
		}

		// dashboard has high cache times for settings, channels, guilds, etc... to speed things up
		// when they're updated the bot can clear those caches to make update times instant while still
		// getting the performance boost from caching
		await cache.guilds.del(guild.id);
	}
};
