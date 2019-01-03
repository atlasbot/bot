const lib = require('atlas-lib/lib/emoji');
const TagError = require('../../TagError');

module.exports = func => (info, [name, ...args], ...extra) => {
	if (!name) {
		throw new TagError('You have to include an emoji name.');
	}

	const emoji = lib.get(name);

	if (!emoji) {
		throw new TagError('No emojis matching search.');
	}

	return func(info, [emoji, ...args], ...extra);
};
