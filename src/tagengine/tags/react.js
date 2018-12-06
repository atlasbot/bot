const TagError = require('./../TagError');

const { emoji: emojiUtil, utils } = require('../../../lib');

module.exports = async ({ guild, msg }, [emojiName]) => {
	if (!emojiName) {
		throw new TagError('[emoji] is required.');
	}

	emojiName = emojiName.replace(/[^0-9a-z-_]/gi, '');

	const emoji = utils.nbsFuzzy(guild.emojis, ['name', 'id'], emojiName) || emojiUtil.get(emojiName);

	if (!emoji) {
		throw new TagError(`Could not find emoji "${emojiName}"`);
	}

	await msg.addReaction(emoji.char || `${emoji.name}:${emoji.id}`);
};

module.exports.info = {
	name: 'react',
	args: '[emoji]',
	description: 'Reacts to the message in context with [emoji]. ',
	examples: [{
		input: '{react;eggplant}',
		output: '',
		note: 'The message in context would have the eggplant emoji added to it.',
	}, {
		input: '{react;🍆}',
		output: '',
		note: 'The message in context would have the eggplant emoji added to it.',
	}],
	dependencies: ['guild', 'msg'],
};
