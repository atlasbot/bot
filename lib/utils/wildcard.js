const escapeRegex = require('./escapeRegex');

/**
 * Converts a string with a wildcard in it "some*string" to regex.
 * @param {string} s The string with the wildcard in it.
 * @returns {regex} The regex with the wildcard replaced
 */
module.exports.wildcardToRegExp = s => new RegExp(`^${s.split(/\*+/).map(escapeRegex).join('.*')}$`);


/**
 * Tests whether or not a wildcard pattern matches a string.
 * @param {string} pattern The pattern to check.
 * @param {string} str The string to test the pattern against, replacing wildcards with actual wildcards.
 * @returns {boolean} true if the pattern is found in the string, false if it wasn't.
 */
module.exports.match = (pattern, str) => {
	const regex = module.exports.wildcardToRegExp(pattern);

	return regex.exec(str);
};
