const middleware = require('./middleware');

module.exports = middleware(({ role }) => role.hoist);

module.exports.info = {
	name: 'role.hoist',
	description: 'Returns a true/false value on whether the role is set to display members separately from online members.',
	args: '[role]',
	examples: [{
		input: '{role.hoist;Developer}',
		output: 'true',
	}, {
		input: '{role.hoist;Atlas}',
		output: 'false',
	}],
	dependencies: ['guild'],
};
