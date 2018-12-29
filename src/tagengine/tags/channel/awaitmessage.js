const middleware = require('./middleware');
const TagError = require('../../TagError');
const Collector = require('../../../structures/MessageCollector');
const parseNumber = require('./../../../../lib/utils/parseNumber');

module.exports = middleware(async ({ channel, Atlas }, [author, timeout = '30']) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	timeout = Atlas.lib.utils.parseNumber(timeout);

	if (isNaN(timeout)) {
		throw new TagError('Timeout must be a number.');
	}

	timeout = parseNumber(timeout);

	const collector = new Collector(channel, msg => !author || msg.author.id === author);

	collector.listen(timeout * 1000);

	const message = await collector.await();

	if (!message) {
		throw new TagError('No message in time');
	}

	if (!message) {
		return;
	}

	return message.content;
}, 1);

module.exports.info = {
	name: 'channel.awaitmessage',
	description: 'Wait for a message in a channel. Returns the message content. Author is a user ID, when set only accept messages from that user. Timeout is, in seconds, how long to wait before giving up if no messages are sent. Defaults to 30s.',
	args: '<author> <timeout> <channel>',
	examples: [{
		input: '{channel.awaitmessage;{user.id};60}',
		output: 'wew',
	}],
	dependencies: ['channel'],
};
