const emoji = require('../emoji');
const isSnowflake = require('./isSnowflake');

// shouldn't really be here but meh
module.exports = (action, guild) => {
	if (action.trigger.type === 'reactionAdd') {
		if (isSnowflake(action.trigger.content)) {
			return {
				custom: true,
				...guild.emojis.find(e => e.id === action.trigger.content),
			};
		}

		return {
			custom: false,
			...emoji.get(action.trigger.content),
		};
	}
};
