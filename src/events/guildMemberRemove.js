module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getGuild(member.guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const embed = {
			title: 'general.logs.guildMemberRemove.title',
			color: this.Atlas.colors.get('cyan').decimal,
			description: ['general.logs.guildMemberRemove.description', member.tag],
			thumbnail: {
				url: member.avatarURL || member.defaultAvatarURL,
			},
			footer: {
				text: `User ${member.id}`,
			},
			timestamp: new Date(),
		};

		return settings.log('action', embed);
	}
};
