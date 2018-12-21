const superagent = require('superagent');

const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

/**
 * Checks whether or not a URL is valid.
 * @param {string} str The URL to check.
 * @param {boolean} [verify=false] Whether to do a HEAD request on the url and check if it's live.
 * @returns {string|void|promise<string|void>} The URL on success, undefined on failure.
 */
module.exports = (str, verify) => {
	const [match] = regex.exec(str) || [];

	if (match) {
		if (!verify) {
			return match;
		}

		return new Promise((resolve) => {
			superagent.head(match)
				.then(() => resolve(match))
				.catch(() => resolve());
		});
	}
};
