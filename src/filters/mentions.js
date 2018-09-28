module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Mention Abuse',
			settingsKey: 'mentions',
			description: 'Triggers if a message contains too many mentions',
		};
	}

	execute(str, msg, filterConfig) {
		if (msg) {
			return msg.mentions.length >= filterConfig.threshold || msg.roleMentions.length >= filterConfig.threshold;
		}
	}
};
