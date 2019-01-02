module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getSettings(guild);

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
				url: member.avatarURL,
			},
			footer: {
				text: `Target ${member.id}`,
			},
			timestamp: new Date(),
		};

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.guildBanAdd.moderator.name',
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

			embed.footer.text += ` Mod ${auditEntry.user.id}`;
		}

		return settings.log('mod', embed);
	}
};
