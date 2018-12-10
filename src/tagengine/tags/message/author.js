const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.author.id);

module.exports.info = {
	name: 'message.authorID',
	description: 'Gets the message author\'s ID.',
	examples: [{
		input: '{message.authorID}',
		output: '111372124383428608',
	}],
	dependencies: ['msg'],
};
