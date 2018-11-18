const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.username);

module.exports.info = {
	name: 'user.username',
	description: 'The username of the user. You can use {user.nickname} to get their nickname, which is preferable in most cases.',
	args: '<user>',
	examples: [{
		input: '{user.username}',
		output: 'Sylver',
	}],
	dependencies: ['user', 'guild'],
};
