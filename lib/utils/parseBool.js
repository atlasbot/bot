const yes = ['1', 'true', 'yes'];
const no = ['0', 'false', 'no'];

/**
 * Parses "yes", "true", "no", "0", etc.. to a boolean.
 * @param {string} str The user input.
 * @returns {boolean} true or false if valid, undefined if it doesn't match any known yes or no inputs.
 */
module.exports = (str) => {
	if (yes.includes(str)) {
		return true;
	}

	if (no.includes(str)) {
		return false;
	}
};
