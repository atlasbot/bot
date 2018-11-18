const middleware = require('./middleware');

module.exports = middleware(({ user }) => user.discriminator);

module.exports.info = {
	name: 'user.discriminator',
	description: 'Gets a users discriminator. It can be anything between 0001 - 9999',
	args: '<user>',
	examples: [{
		input: '{user.discriminator}',
		output: '1058',
		note: 'This assumes their tag was Sylver#1058. ',
	}],
	dependencies: ['user', 'guild'],
};
