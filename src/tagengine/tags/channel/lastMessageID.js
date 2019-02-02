const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(({ channel }) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	return channel.lastMessageID;
});

module.exports.info = {
	name: 'channel.lastMessageID',
	description: 'Gets the ID of the last message in the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.lastMessageID}',
		output: '520723523166011403',
	}],
	dependencies: ['channel'],
};
