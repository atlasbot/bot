const middleware = require('./middleware');

module.exports = middleware(({ channel }) => channel.name);

module.exports.info = {
	name: 'channel.name',
	description: 'Gets the name of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.name}',
		output: 'general',
	}],
	dependencies: ['channel'],
};
