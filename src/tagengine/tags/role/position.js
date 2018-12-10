const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.position);

module.exports.info = {
	name: 'role.position',
	description: 'Gets the position of a role.',
	args: '[role]',
	examples: [{
		input: '{role.position;Developer}',
		output: '7',
	}],
	dependencies: ['guild'],
};
