const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.mentionable);

module.exports.info = {
	name: 'role.mentionable',
	description: 'Returns a true/false value on whether the role can be mentioned.',
	args: '[role]',
	examples: [{
		input: '{role.mentionable;Developer}',
		output: 'false',
	}],
	dependencies: ['guild'],
};
