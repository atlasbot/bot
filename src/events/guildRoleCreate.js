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

		const settings = await this.Atlas.DB.settings(guild);

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, role.id, 30);

		const embed = {
			title: 'general.logs.guildRoleCreate.title',
			color: this.Atlas.colors.get('blue grey').decimal,
			description: ['general.logs.guildRoleCreate.description', role.mention],
			fields: [],
			footer: {
				text: `Role ${role.id}`,
			},
			timestamp: new Date(),
		};

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.guildRoleCreate.moderator.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			embed.footer.text += ` Mod ${auditEntry.user.id}`;
		}

		return settings.log('action', embed);
	}
};
