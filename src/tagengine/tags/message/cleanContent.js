const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.cleanContent);

module.exports.info = {
	name: 'message.cleanContent',
	description: 'Gets the clean message content.',
	examples: [{
		input: '{message.cleanContent}',
		output: 'An example message, mention: @Sylver, regular emoji: 😄 guild emoji: <a:safetyjim:418855513116246016>',
	}],
	dependencies: ['msg'],
};
