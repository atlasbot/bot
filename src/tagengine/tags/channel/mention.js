const middleware = require('./middleware');

module.exports = middleware(({ channel }) => channel.mention);

module.exports.info = {
	name: 'channel.mention',
	description: 'Gets the #mention of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.mention}',
		output: '#general',
	}],
	dependencies: ['channel'],
};
