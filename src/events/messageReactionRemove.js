module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		const user = this.Atlas.client.users.get(userID);

		if (userID === this.Atlas.client.user.id) {
			return;
		}

		if (!msg.author) {
			msg = await this.Atlas.client.getMessage(msg.channel.id, msg.id);
		}

		if (msg.guild && user) {
			const settings = await this.Atlas.DB.getGuild(msg.guild.id);

			await settings.runActions({
				guild: msg.guild.id,
				'trigger.type': 'reactionRemove',
				// emoji.id is only set for custom emojis, otherwise atlas uses the emoji as the content
				'trigger.content': emoji.id || emoji.name,
			}, {
				msg,
				user,
			});
		}
	}
};
