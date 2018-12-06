const middleware = require('./middleware');

module.exports = middleware(({ channel }) => channel.id);

module.exports.info = {
	name: 'channel.id',
	description: 'Gets the ID of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.id}',
		output: '357192331021254656',
	}],
	dependencies: ['channel'],
};
