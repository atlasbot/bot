const validUrl = require('valid-url');

/**
 * Checks whether or not a URL is valid.
 * @param {string} str The URL to check.
 * @returns {string|undefined} The URL on success, undefined on failure.
 */
module.exports = str => validUrl.isUri(str);
