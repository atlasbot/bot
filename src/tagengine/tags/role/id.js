const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.id);

module.exports.info = {
	name: 'role.id',
	description: 'Gets the ID of a role.',
	args: '[role]',
	examples: [{
		input: '{role.id;Developer}',
		output: '340583469149192204',
	}],
	dependencies: ['guild'],
};
