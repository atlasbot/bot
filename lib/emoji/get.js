const emoji = require('emojilib').lib;
const Fuzzy = require('../structures/Fuzzy');

const emojis = Object.entries(emoji).map(([name, data]) => ({ name, ...data }));

/**
 * Gets an emoji by name, using fuzzy searching.
 * @param {string} name The name of the emoji.
 * @returns {Object} The emoji
 */
module.exports = (name) => {
	const byName = emoji[name];

	if (byName) {
		return {
			name,
			...byName,
		};
	}

	return (new Fuzzy(emojis, {
		keys: [
			'name',
			'char',
			'keywords',
		],
	})).search(name);
};
