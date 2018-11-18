const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.mention);

module.exports.info = {
	name: 'user.mention',
	description: 'Mention a @user.',
	args: '<user>',
	examples: [{
		input: '{user.mention}',
		output: '@Sylver#1058',
	}],
	dependencies: ['user', 'guild'],
};
