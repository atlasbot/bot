const Filter = require('./../structures/Filter');

module.exports = class Mentions extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig: { threshold },
	}) {
		return msg.mentions.length >= threshold || msg.roleMentions.length >= threshold;
	}
};

module.exports.info = {
	name: 'Mentions',
	settingsKey: 'mentions',
	description: 'Triggers if a message contains too many mentions',
};
