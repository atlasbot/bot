module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(channel) {
		const settings = channel.guild && await this.Atlas.DB.settings(channel.guild);

		if (!channel.guild || !settings.actionLogChannel) {
			return;
		}

		const type = this.Atlas.lib.utils.getChannelType(channel.type);

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(channel.guild, channel.id, 10);

		const embed = {
			title: 'general.logs.channelCreate.title',
			color: this.Atlas.colors.get('green').decimal,
			description: ['general.logs.channelCreate.description', channel.mention, channel.name, type],
			fields: [],
			footer: {
				text: `Channel ${channel.id}`,
			},
			timestamp: new Date(),
		};

		if (channel.parentID) {
			const { name } = channel.guild.channels.get(channel.parentID);
			embed.fields.push({
				name: 'general.logs.channelCreate.category.name',
				value: name,
				inline: true,
			});
		}

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.channelCreate.moderator.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			embed.footer.text += ` User ${auditEntry.user.id}`;
		}

		return settings.log('action', embed);
	}
};
