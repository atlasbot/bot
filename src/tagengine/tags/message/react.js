const TagError = require('./../../TagError');
const middleware = require('./middleware');

module.exports = middleware(async ({ guild, msg, channel, Atlas }, [emojiName]) => {
	console.log(emojiName);

	if (!channel.permissionsOf(guild.me.id).has('addReactions')) {
		throw new TagError('Missing permissions');
	}

	if (!emojiName.trim()) {
		throw new TagError('[emoji] is required.');
	}

	emojiName = emojiName.replace(/;|</gi, '');

	const emoji = Atlas.lib.emoji.get(emojiName) || Atlas.lib.utils.nbsFuzzy(guild.emojis, ['name', 'id', 'char'], emojiName);

	if (!emoji) {
		throw new TagError(`Could not find emoji "${emojiName}"`);
	}

	await msg.addReaction(emoji.char || `${emoji.name}:${emoji.id}`);
}, 1);

module.exports.info = {
	name: 'message.react',
	args: '[emoji] <message id> <channel id>',
	description: 'Reacts to the message in context with [emoji]. ',
	examples: [{
		input: '{message.react;eggplant}',
		output: '',
		note: 'The message in context would have the eggplant emoji added to it.',
	}, {
		input: '{message.react;🍆}',
		output: '',
		note: 'The message in context would have the eggplant emoji added to it.',
	}],
	dependencies: ['guild', 'msg', 'channel'],
};
