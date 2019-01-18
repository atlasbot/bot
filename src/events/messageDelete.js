module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg) {
		this.Atlas.sent = this.Atlas.sent.filter(s => s.msg.id !== msg.id);

		if (msg.type === 0 && msg.guild && !msg.author.bot) {
			if (this.Atlas.deleteAliases.has(msg.id)) {
				const x = this.Atlas.deleteAliases.get(msg.id);

				this.Atlas.client.deleteMessage(x.channel, x.msg).catch(console.error);
			}

			const settings = await this.Atlas.DB.settings(msg.guild);

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
					url: msg.author.avatarURL,
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

				const types = [];
				if (!msg.channel.topic || !msg.channel.topic.includes('actionlog-ignore')) {
					types.push('action');
				}

				if (!msg.channel.topic || !msg.channel.topic.includes('modlog-ignore')) {
					types.push('mod');
				}

				// if it was deleted by a moderator it's probably worth while to log it
				await settings.log('mod', embed);

				return settings.log('action', embed);
			}

			if (msg.channel.topic && msg.channel.topic.includes('actionlog-ignore')) {
				return;
			}

			return settings.log('action', embed);
		}
	}
};
