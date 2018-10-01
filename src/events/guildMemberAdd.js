module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getGuild(guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const embed = {
			title: 'general.logs.guildMemberAdd.title',
			color: this.Atlas.colors.get('cyan').decimal,
			description: ['general.logs.guildMemberAdd.description', member.tag],
			fields: [{
				name: 'Account Created',
				value: (new Date(member.createdAt)).toLocaleDateString(),
			}],
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
