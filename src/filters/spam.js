module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Spam',
			settingsKey: 'spam',
		};
	}

	execute(str, msg) {
		if (!msg.channel.messages) return;
		const messages = Array.from(msg.channel.messages.values())
			// TODO: make the "7500" time customisable
			.filter(m => m.author.id === msg.author.id && ((new Date()) - m.timestamp) < 7500);

		// TODO: make "4" customisable
		return messages.length > 4;
	}
};
