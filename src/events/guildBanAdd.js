module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getGuild(guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, member.id, 22);

		const embed = {
			title: 'general.logs.guildBanAdd.title',
			color: this.Atlas.colors.get('red').decimal,
			description: ['general.logs.guildBanAdd.description', member.tag],
			fields: [],
			thumbnail: {
				url: member.avatarURL || member.defaultAvatarURL,
			},
			footer: {
				text: `Target ${member.id}`,
			},
			timestamp: new Date(),
		};

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.guildBanAdd.bannedBy.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			if (auditEntry.reason) {
				embed.fields.push({
					name: 'general.logs.guildBanAdd.reason.name',
					value: auditEntry.reason,
					inline: true,
				});
			}

			embed.footer.text += ` Moderator ${auditEntry.user.id}`;
		}

		return settings.log(['action', 'mod'], embed);
	}
};
