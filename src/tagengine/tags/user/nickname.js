const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.nick || user.username);

module.exports.info = {
	aliases: ['user.nick'],
	name: 'user.nickname',
	description: 'The nickname of the user. ',
	args: '<user>',
	examples: [{
		input: '{user.nickname}',
		output: 'sylver',
	}],
	dependencies: ['user', 'guild'],
};
