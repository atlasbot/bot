const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.id);

module.exports.info = {
	name: 'user.id',
	description: 'Gets a users id, otherwise known as snowflake.',
	args: '<user>',
	examples: [{
		input: '{user.id}',
		output: '111372124383428608',
	}],
	dependencies: ['user', 'guild'],
};
