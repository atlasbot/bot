const cache = require('../cache');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, role) {
		// dashboard has high cache times for settings, channels, guilds, etc... to speed things up
		// when they're updated the bot can clear those caches to make update times instant while still
		// getting the performance boost from caching
		await cache.guilds.del(guild.id);

		const settings = await this.Atlas.DB.getGuild(guild);

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, role.id, 32);

		const embed = {
			title: 'general.logs.guildRoleDelete.title',
			color: this.Atlas.colors.get('blue grey').decimal,
			description: ['general.logs.guildRoleDelete.description', role.name],
			fields: [],
			footer: {
				text: `Role ${role.id}`,
			},
			timestamp: new Date(),
		};

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.guildRoleDelete.moderator.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			embed.footer.text += ` Mod ${auditEntry.user.id}`;
		}

		return settings.log('action', embed);
	}
};
