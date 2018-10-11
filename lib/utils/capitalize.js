/**
 * Converts the first letter of a string to Uppercase
 * @param {string} str The string to capitalize
 * @returns {string} The capitalized string
 */
module.exports = str => str.charAt(0).toUpperCase() + str.slice(1);
