const emojis = require('./../emojis.json');

Object.keys(emojis).forEach((k) => {
	emojis[k].forEach((e) => {
		[e.name] = e.names;
	});
});

/**
 * Gets information about an emoji
 * @param {string} name the emoji code
 * @returns {Object|void}
 */
module.exports = name => module.exports.findEmoji(e => e.surrogates === name);

/**
 * Finds an emoji by name, e.g 'one or 'tada'
 * @param {string} name The name to search for
 * @returns {Object|void}
 */
module.exports.fromName = name => module.exports.findEmoji(e => e.names.includes(name));

/**
 * Basically Array#find on the list of emojis
 * @param {function} func the function to use
 * @returns {Object|Void}
 */
module.exports.findEmoji = func => module.exports.array().find(func);

/**
 * Gets an array of all emojis
 * @returns {Array<Object>}
 */
module.exports.array = () => {
	// best variable name 2k11
	const x = [];
	for (const key of Object.keys(emojis)) {
		x.push(...emojis[key]);
	}

	return x;
};
