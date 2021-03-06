const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(({ channel }) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	return channel.topic;
});

module.exports.info = {
	name: 'channel.topic',
	description: 'Gets the topic of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.topic}',
		output: 'Welcome to General',
		note: 'This assumes the channel topic is set to "Welcome to General"',
	}],
	dependencies: ['channel'],
};
