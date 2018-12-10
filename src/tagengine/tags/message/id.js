const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.id);

module.exports.info = {
	name: 'message.id',
	description: 'Gets the message ID.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.id}',
		output: '521710205201809408',
	}],
	dependencies: ['msg'],
};
