const Filter = require('./../structures/Filter');

module.exports = class Mentions extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig,
	}) {
		if (msg) {
			return msg.mentions.length >= filterConfig.threshold || msg.roleMentions.length >= filterConfig.threshold;
		}
	}
};

module.exports.info = {
	name: 'Mentions',
	settingsKey: 'mentions',
	description: 'Triggers if a message contains too many mentions',
};
