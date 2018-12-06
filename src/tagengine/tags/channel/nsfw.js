const middleware = require('./middleware');

module.exports = middleware(({ channel }) => channel.nsfw);

module.exports.info = {
	name: 'channel.nsfw',
	description: 'Whether or not the current channel is not safe for work.',
	args: '<channel>',
	examples: [{
		input: '{channel.nsfw}',
		output: 'false',
		note: 'This assumes the channel is not marked as NSFW.',
	}],
	dependencies: ['channel'],
};
