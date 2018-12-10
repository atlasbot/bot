const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.content);

module.exports.info = {
	name: 'message.content',
	description: 'Gets the raw message content.',
	examples: [{
		input: '{message.content}',
		output: 'An example message, mention: <@111372124383428608>, regular emoji: 😄 guild emoji: <a:safetyjim:418855513116246016>',
	}],
	dependencies: ['msg'],
};
