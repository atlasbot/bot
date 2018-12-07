const Filter = require('./../structures/Filter');

module.exports = class Spam extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
		this.triggered = [];
	}

	execute(str, msg, {
		filterConfig: { time, threshold },
	}) {
		const messages = Array.from(msg.channel.messages.values())
			.filter(m => m.author.id === msg.author.id && (Date.now() - m.timestamp) < time && !this.triggered.includes(m.id));

		const triggered = messages.length > threshold && messages.map(m => m.id);

		if (triggered) {
			this.triggered.push(...triggered);
		}

		return triggered;
	}
};

module.exports.info = {
	name: 'Spam',
	settingsKey: 'spam',
};
