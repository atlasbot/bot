const constants = require('./../constants');

/**
 * Gets the toggle type. E.g, if "off" is the str, this will return false. If "on" is the str, "true" will be returned.
 * @param {string} str The string to check
 * @param {boolean} _throw Whether to throw if it's an unknown toggle type.
 * @returns {boolean|void} A true or false value depending on what was inputted. Could also be undefined.
 */
module.exports = (str, _throw = true) => {
	const clean = str.trim().toLowerCase();

	if (constants.enableWords.includes(clean)) {
		return true;
	}

	if (constants.disableWords.includes(clean)) {
		return false;
	}

	if (_throw) {
		throw new Error('Unknown type.');
	}
};
