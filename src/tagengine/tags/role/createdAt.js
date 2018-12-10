const middleware = require('./middleware');
const timeFormat = require('../../../../lib/utils/timeFormat');

module.exports = middleware(({ role }, [exact]) => timeFormat(role.createdAt, exact === 'true'));

module.exports.info = {
	name: 'role.createdAt',
	description: 'Returns the date the role was created. "exact" is a true/false value on whether to include hours/minutes.',
	args: '[role] <exact>',
	examples: [{
		input: '{role.createdAt;Developer}',
		output: 'Jul 28, 2017',
	}, {
		input: '{role.createdAt;Developer;true}',
		output: 'Jul 28, 2017, 7:57 PM',
	}],
	dependencies: ['guild'],
};
