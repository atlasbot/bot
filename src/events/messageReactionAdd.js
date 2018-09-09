module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		if (userID === this.Atlas.client.user.id) return;

		if (this.Atlas.collectors.emojis[msg.id]) {
			const collector = this.Atlas.collectors.emojis[msg.id];
			collector.fire(msg, emoji, userID);
		}
		// in a dev environment this will let people re-run commands
		if (this.Atlas.env === 'development' && emoji.name === '🔁') {
			const fetchedMsg = await this.Atlas.client.getMessage(msg.channel.id, msg.id);
			this.Atlas.client.emit('messageCreate', fetchedMsg);
			this.Atlas.client.removeMessageReaction(
				fetchedMsg.channel.id,
				fetchedMsg.id,
				'🔁',
				userID,
			)
				.catch(() => false);
			this.Atlas.client.purgeChannel(msg.channel.id, 100, m => m.author.bot, null, fetchedMsg.id)
				.catch(() => false);
		}
	}
};
