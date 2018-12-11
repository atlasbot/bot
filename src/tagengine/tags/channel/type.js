const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(({ channel }) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	return channel.type;
});

module.exports.info = {
	name: 'channel.type',
	description: 'Gets the type of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.type}',
		output: '0',
		note: 'Full list of types available here: https://discordapp.com/developers/docs/resources/channel#channel-object-channel-types',
	}],
	dependencies: ['channel'],
};
