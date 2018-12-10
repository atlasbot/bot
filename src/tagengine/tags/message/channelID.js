const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.channel.id);

module.exports.info = {
	name: 'message.authorID',
	description: 'Gets the channel ID the message was sent to.',
	examples: [{
		input: '{message.channelID}',
		output: '473962909765206016',
	}],
	dependencies: ['msg'],
};
