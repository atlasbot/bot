const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.name);

module.exports.info = {
	name: 'role.name',
	description: 'Gets the name of a role.',
	args: '[role]',
	examples: [{
		input: '{role.name;tes}',
		output: 'test',
		note: 'This assumes the role name is "test" and the input is incomplete.',
	}, {
		input: '{role.name;340583469149192204}',
		output: 'Developer',
		note: 'This assumes the ID "340583469149192204" is for the "Developer" role.',
	}],
	dependencies: ['guild'],
};
