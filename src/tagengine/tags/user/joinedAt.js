const middleware = require('./middleware');
const timeFormat = require('../../../../lib/utils/timeFormat');

// todo: maybe format nicer or something
module.exports = middleware(({ user, guild }, [exact]) => {
	const member = guild.members.get(user.id);

	return timeFormat(member.joinedAt, exact === 'true');
}, 1);

module.exports.info = {
	name: 'user.joinedAt',
	description: 'Returns the date the user joined the server at. "exact" is a true/false value on whether to include hours/minutes.',
	args: '<exact> <user>',
	examples: [{
		input: '{user.joinedAt}',
		output: 'Jul 28, 2017',
	}, {
		input: '{user.joinedAt;true}',
		output: 'Jul 28, 2017, 7:56 PM',
	}],
	dependencies: ['user', 'guild'],
};
