const Filter = require('./../structures/Filter');

const CUSTOM_EMOJI_REGEX = /<:([A-z0-9-_]+):([0-9]+)>/g;

module.exports = class Mentions extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig: { threshold },
	}) {
		const defaultEmojis = (str.match(this.Atlas.lib.emoji.regex()) || '').length;
		// checking to makes sure the emojis are valid may be worth while
		const customEmojis = (str.match(CUSTOM_EMOJI_REGEX) || '').length;

		return (defaultEmojis + customEmojis) > threshold;
	}
};

module.exports.info = {
	name: 'Emoji',
	settingsKey: 'emoji',
	description: 'Detects and removes messages with excessive emojis.',
};
