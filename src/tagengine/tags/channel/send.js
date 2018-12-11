const middleware = require('./middleware');
const TagError = require('../../TagError');
const Responder = require('../../../structures/Responder');

module.exports = middleware(async ({ channel }, [content]) => {
	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

	const responder = new Responder(channel, 'en');

	await responder.channel(channel).localised(true).text(content).send();
}, 1);

module.exports.info = {
	name: 'channel.send',
	description: 'Sends a message to the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.send;ayyy}',
		output: 'ayyy',
	}, {
		input: '{channel.send;ayyy;#general}',
		output: 'ayyy',
		note: 'Output would be sent to the #general channel, regardless of where it was called.',
	}],
	dependencies: ['channel'],
};
