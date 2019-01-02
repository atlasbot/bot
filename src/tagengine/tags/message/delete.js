const TagError = require('../../TagError');
const middleware = require('./middleware');

module.exports = middleware(async ({ msg, guild, channel }) => {
	if (!channel.permissionsOf(guild.me.id).has('manageMessages')) {
		throw new TagError('Missing permissions');
	}

	if (msg.delete) {
		await msg.delete();
	}
});

module.exports.info = {
	name: 'message.delete',
	description: 'Deletes the message.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.embed}',
		output: 'false',
	}],
	dependencies: ['msg', 'guild', 'channel'],
};
