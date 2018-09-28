module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Spam',
			settingsKey: 'spam',
		};
		this.triggered = [];
	}

	execute(str, msg, filterConfig) {
		const messages = Array.from(msg.channel.messages.values())
			.filter(m => m.author.id === msg.author.id && ((new Date()) - m.timestamp) < filterConfig.time && !this.triggered.includes(m.id));

		const triggered = messages.length > filterConfig.threshold;

		if (triggered) {
			this.triggered.push(...messages.map(m => m.id));
		}

		return triggered;
	}
};
