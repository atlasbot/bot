const yes = ['1', 'true', 'yes', 'enable', 'on'];
const no = ['0', 'false', 'no', 'off', 'disable'];

/**
 * Parses "yes", "true", "no", "0", etc.. to a boolean.
 * @param {string} str The user input.
 * @returns {boolean} true or false if valid, undefined if it doesn't match any known yes or no inputs.
 */
module.exports = (str) => {
	const query = str.trim().toLowerCase();

	if (yes.includes(query)) {
		return true;
	}

	if (no.includes(query)) {
		return false;
	}
};
