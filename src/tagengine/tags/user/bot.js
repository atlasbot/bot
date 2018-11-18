const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.bot);

module.exports.info = {
	name: 'user.bot',
	description: 'Checks whether a user is a bot. Returns true/false.',
	args: '<user>',
	examples: [{
		input: '{user.bot}',
		output: 'false',
		note: 'Assumes the user in context is not a bot. ',
	}, {
		input: '{user.bot;Atlas}',
		output: 'true',
		note: 'Assumes the user in context is a bot. ',
	}],
	dependencies: ['user', 'guild'],
};
