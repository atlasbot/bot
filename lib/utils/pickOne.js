const randomInt = require('./randomInt');

/**
 * Gets a random item from the provided array.
 * @param {Array} arr The array
 * @returns {*} The item from the array
 */
module.exports = arr => arr[randomInt(arr.length)];
