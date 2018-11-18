const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.avatarURL);

module.exports.info = {
	name: 'user.avatarURL',
	description: 'The avatar URL of the user. ',
	args: '<user>',
	examples: [{
		input: '{user.avatarURL}',
		output: 'https://cdn.discordapp.com/avatars/111372124383428608/a_db60101ca8c6b08e7e1d1ffb23fe0326.gif?size=128',
	}],
	dependencies: ['user', 'guild'],
};
