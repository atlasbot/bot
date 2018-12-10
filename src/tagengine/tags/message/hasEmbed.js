const middleware = require('./middleware');

module.exports = middleware(({ msg }) => !!msg.embeds.length);

module.exports.info = {
	name: 'message.hasEmbed',
	description: 'Returns true if the message has an embed, false in any other circumstance.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.embed}',
		output: 'false',
	}],
	dependencies: ['msg'],
};
