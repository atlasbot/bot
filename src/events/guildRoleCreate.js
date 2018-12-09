module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, role) {
		const settings = await this.Atlas.DB.getSettings(guild.id);

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
