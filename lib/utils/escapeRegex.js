/**
 * Escapes regex
 * @param {string} s The string with regex maybe in it
 * @returns {string} the string with regex maybe not in it
 */
module.exports = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
