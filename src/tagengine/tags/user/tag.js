const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.tag);

module.exports.info = {
	name: 'user.tag',
	description: 'Gets a users tag.',
	args: '<user>',
	examples: [{
		input: '{user.tag}',
		output: 'Sylver#1058',
	}],
	dependencies: ['user', 'guild'],
};
