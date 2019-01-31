const timeFormat = require('atlas-lib/lib/utils/timeFormat');

module.exports = ({ guild }, [exact]) => timeFormat(guild.createdAt, exact === 'true');

module.exports.info = {
	name: 'guild.createdAt',
	description: 'Returns the date the guild was created. "exact" is a true/false value on whether to include hours/minutes.',
	args: '<exact>',
	examples: [{
		input: '{guild.createdAt}',
		output: 'Jul 31, 2018',
	}, {
		input: '{guild.createdAt;true}',
		output: 'Jul 31, 2018, 9:19 PM',
	}],
	dependencies: ['guild'],
};
