const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.nickname || user.username);

module.exports.info = {
	name: 'user.nickname',
	description: 'The nickname of the user. ',
	args: '<user>',
	examples: [{
		input: '{user.nickname}',
		output: 'sylver',
	}],
	dependencies: ['user', 'guild'],
};
