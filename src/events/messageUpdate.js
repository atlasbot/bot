module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, oldMsg) {
		if (msg.type === 0 && msg.guild && !msg.author.bot) {
			const settings = await this.Atlas.DB.getGuild(msg.guild.id);

			if (!settings.actionLogChannel) {
				return;
			}

			const embed = {
				title: 'general.logs.messageUpdate.title',
				color: this.Atlas.colors.get('blue').decimal,
				description: ['general.logs.messageUpdate.description', msg.author.tag, msg.channel.mention],
				fields: [{
					name: 'general.logs.messageUpdate.oldContent.name',
					value: oldMsg.content.substring(0, 1024),
				}, {
					name: 'general.logs.messageUpdate.newContent.name',
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

			return settings.log('action', embed);
		}
	}
};
