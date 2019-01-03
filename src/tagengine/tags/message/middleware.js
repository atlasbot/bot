const isSnowflake = require('atlas-lib/lib/utils/isSnowflake');
const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	channel,
	msg,
	Atlas,
	...context
}, args, ...randomShit) => {
	if (args[argIndex] && isSnowflake(args[argIndex])) {
		msg = await Atlas.client.getMessage(args[argIndex + 1] || channel.id, args[argIndex]);

		if (!msg || msg.type !== 0) {
			throw new TagError('Invalid message ID.');
		}
	}

	return func({
		channel,
		msg,
		Atlas,
		...context,
	}, args, ...randomShit);
};
