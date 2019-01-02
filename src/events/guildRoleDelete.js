module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, role) {
		const settings = await this.Atlas.DB.getSettings(guild);

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
