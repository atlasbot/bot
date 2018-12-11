const TagError = require('./../../TagError');
const isSnowflake = require('../../../../lib/utils/isSnowflake');

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
