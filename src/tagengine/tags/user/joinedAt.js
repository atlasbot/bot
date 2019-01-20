const timeFormat = require('atlas-lib/lib/utils/timeFormat');

const TagError = require('../../TagError');
const middleware = require('./middleware');

module.exports = middleware(async ({ user, settings }, [exact]) => {
	const member = await settings.findUser(user.id, {
		memberOnly: true,
	});

	if (!member) {
		throw new TagError('Could not resolve user to a server member.');
	}

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
	dependencies: ['user', 'settings'],
};
