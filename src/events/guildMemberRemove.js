module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getGuild(member.guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, member.id, 20);

		if (auditEntry) {
			// the user has been kicked

			// the user probably left of their own free will

			return settings.log(['action', 'mod'], {
				title: 'general.logs.guildMemberKick.title',
				color: this.Atlas.colors.get('cyan').decimal,
				description: ['general.logs.guildMemberKick.description', member.tag],
				thumbnail: {
					url: member.avatarURL,
				},
				fields: [{
					name: 'general.logs.guildMemberKick.moderator.name',
					value: auditEntry.user.tag,
				}],
				footer: {
					text: `User ${member.id} Mod ${auditEntry.user.id}`,
				},
				timestamp: new Date(),
			});
		}

		// the user probably left of their own free will

		return settings.log('action', {
			title: 'general.logs.guildMemberRemove.title',
			color: this.Atlas.colors.get('cyan').decimal,
			description: ['general.logs.guildMemberRemove.description', member.tag],
			thumbnail: {
				url: member.avatarURL,
			},
			footer: {
				text: `User ${member.id}`,
			},
			timestamp: new Date(),
		});
	}
};
