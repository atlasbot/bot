const middleware = require('./middleware');

module.exports = middleware(async ({ user, settings }) => {
	if (user.nick) {
		return user.nick;
	}

	const member = await settings.findUser(user.id, {
		memberOnly: true,
	});

	if (!member) {
		return user.username;
	}

	return member.nick || user.username;
});

module.exports.info = {
	aliases: ['user.nick'],
	name: 'user.nickname',
	description: 'The nickname of the user. ',
	args: '<user>',
	examples: [{
		input: '{user.nickname}',
		output: 'sylver',
	}],
	dependencies: ['user', 'settings'],
};
