const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(({ channel, Atlas }) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	return Atlas.lib.utils.getChannelType(channel.type);
});

module.exports.info = {
	name: 'channel.cleanType',
	description: 'Gets the name of the type of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.cleanType}',
		output: 'text',
	}],
	dependencies: ['channel'],
};
