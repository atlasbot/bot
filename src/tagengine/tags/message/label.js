const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.label);

module.exports.info = {
	name: 'message.label',
	description: 'If the message called a command, this is the command name. Will not work for messages that are fetched via <message id>.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.label}',
		output: 'test',
	}],
	dependencies: ['msg'],
};
