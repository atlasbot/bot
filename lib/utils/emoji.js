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

/**
 * Returns emoji regex.
 * @returns {Regex}
 */
module.exports.regex = () => /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
