const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.pinned);

module.exports.info = {
	name: 'message.pinned',
	description: 'Returns true/false on whether the message is pinned or not.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.pinned}',
		output: 'false',
	}],
	dependencies: ['msg'],
};
