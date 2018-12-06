const TagError = require('../../TagError');
const lib = require('../../../../lib/emoji');

module.exports = func => (info, [name, ...args], ...extra) => {
	if (!name) {
		throw new TagError('You have to include an emoji name.');
	}

	const emoji = lib.get(name);

	if (!emoji) {
		throw new TagError('No emojis matching query.');
	}

	return func(info, [emoji, ...args], ...extra);
};
