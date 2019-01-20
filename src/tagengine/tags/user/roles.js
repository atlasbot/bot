const middleware = require('./middleware');

module.exports = middleware(async ({ user, settings }) => {
	const member = await settings.findUser(user.id, {
		memberOnly: true,
	});

	if (member && member.roles) {
		return member.roles.join(' ');
	}
});

module.exports.info = {
	name: 'user.roles',
	description: 'Returns a list of the members roles.',
	args: '<user>',
	examples: [{
		input: '{user.roles}',
		output: '340583469149192204 442989971020840960',
	}],
	dependencies: ['user', 'settings'],
};
