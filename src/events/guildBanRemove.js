module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getSettings(guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, member.id, 23);

		const embed = {
			title: 'general.logs.guildBanRemove.title',
			color: this.Atlas.colors.get('red').decimal,
			description: ['general.logs.guildBanRemove.description', member.tag],
			fields: [],
			thumbnail: {
				url: member.avatarURL,
			},
			footer: {
				text: `Target ${member.id}`,
			},
			timestamp: new Date(),
		};

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.guildBanRemove.moderator.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			if (auditEntry.reason) {
				embed.fields.push({
					name: 'general.logs.guildBanRemove.reason.name',
					value: auditEntry.reason,
					inline: true,
				});
			}

			embed.footer.text += ` Mod ${auditEntry.user.id}`;
		}

		return settings.log('mod', embed);
	}
};
