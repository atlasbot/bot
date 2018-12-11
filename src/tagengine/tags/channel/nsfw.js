const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(({ channel }) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	return channel.nsfw;
});

module.exports.info = {
	name: 'channel.nsfw',
	description: 'Whether or not the current channel is not safe for work.',
	args: '<channel>',
	examples: [{
		input: '{channel.nsfw}',
		output: 'false',
		note: 'This assumes the channel is not marked as NSFW.',
	}],
	dependencies: ['channel'],
};
