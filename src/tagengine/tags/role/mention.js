const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.mention);

module.exports.info = {
	name: 'role.mention',
	description: 'Returns the role @mention.',
	args: '[role]',
	examples: [{
		input: '{role.mention;Developer}',
		output: '@Developer',
	}],
	dependencies: ['guild'],
};
