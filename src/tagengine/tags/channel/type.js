const middleware = require('./middleware');

module.exports = middleware(({ channel, Atlas }) => Atlas.lib.utils.getChannelType(channel.type));

module.exports.info = {
	name: 'channel.type',
	aliases: ['channel.cleanType'],
	description: 'Gets the type of the channel.',
	args: '<channel>',
	examples: [{
		input: '{channel.type}',
		output: 'text',
	}, {
		input: '{channel.type;vc-1}',
		output: 'voice',
	}],
	dependencies: ['channel'],
};
