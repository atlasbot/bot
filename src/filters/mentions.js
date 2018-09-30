module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	execute(str, msg, filterConfig) {
		if (msg) {
			return msg.mentions.length >= filterConfig.threshold || msg.roleMentions.length >= filterConfig.threshold;
		}
	}
};

module.exports.info = {
	name: 'Mention Abuse',
	settingsKey: 'mentions',
	description: 'Triggers if a message contains too many mentions',
};
