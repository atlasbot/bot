const middleware = require('./middleware');

module.exports = middleware(({ channel }) => channel.topic);

module.exports.info = {
	name: 'channel.topic',
	description: 'Gets the topic of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.topic}',
		output: 'Welcome to General',
		note: 'This assumes the channel topic is set to "Welcome to General"',
	}],
	dependencies: ['channel'],
};
