module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg) {
		this.Atlas.sent = this.Atlas.sent.filter(s => s.msg.id !== msg.id);

		if (msg.type === 0 && msg.guild && !msg.author.bot) {
			const settings = await this.Atlas.DB.getGuild(msg.guild.id);

			if (!settings.actionLogChannel) {
				return;
			}

			const auditEntry = await this.Atlas.util.getGuildAuditEntry(msg.guild, msg.id, 72);

			const embed = {
				title: 'general.logs.messageDelete.title',
				color: this.Atlas.colors.get('blue').decimal,
				description: ['general.logs.messageDelete.description', msg.author.tag, msg.channel.mention],
				fields: [{
					name: 'general.logs.messageDelete.content.name',
					value: msg.content.substring(0, 1024),
				}],
				thumbnail: {
					url: msg.author.avatarURL || msg.author.defaultAvatarURL,
				},
				footer: {
					text: `User ${msg.author.id}`,
				},
				timestamp: new Date(),
			};

			if (auditEntry) {
				embed.fields.push({
					name: 'general.logs.messageDelete.moderator.name',
					value: auditEntry.user.tag,
					inline: true,
				});

				if (auditEntry.reason) {
					embed.fields.push({
						name: 'general.logs.messageDelete.reason.name',
						value: auditEntry.reason,
						inline: true,
					});
				}

				embed.footer.text += ` Mod ${auditEntry.user.id}`;

				// if it was deleted by a moderator it's probably worth while to log it
				return settings.log(['mod', 'action'], embed);
			}

			return settings.log('action', embed);
		}
	}
};
