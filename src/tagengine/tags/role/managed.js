const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.managed);

module.exports.info = {
	name: 'role.managed',
	description: 'Returns a true/false value on whether the role is managed by a third party connection.',
	args: '[role]',
	examples: [{
		input: '{role.managed;Developer}',
		output: 'false',
	}, {
		input: '{role.managed;Atlas}',
		output: 'true',
	}],
	dependencies: ['guild'],
};
