const timeFormat = require('atlas-lib/lib/utils/timeFormat');
const middleware = require('./middleware');

module.exports = middleware(({ user }, [exact]) => timeFormat(user.createdAt, exact === 'true'), 1);

module.exports.info = {
	name: 'user.createdAt',
	description: 'Returns the date the users account was created. "exact" is a true/false value on whether to include hours/minutes.',
	args: '<exact> <user>',
	examples: [{
		input: '{user.createdAt}',
		output: 'Nov 4, 2015',
	}, {
		input: '{user.createdAt;true}',
		output: 'Nov 4, 2015, 7:53 AM',
	}],
	dependencies: ['user', 'guild'],
};
