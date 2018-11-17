/**
 * Gets a random integer between two values.
 * @param {number} min The minimum value. If max is unset, this will be the max instead and the minimum will be 0.
 * @param {number} max The maximum value.
 * @returns {number} A number between the two ranges.
 */
module.exports = (min, max) => {
	if (!max) {
		return Math.floor(Math.random() * min);
	}

	return Math.floor(Math.random() * (max - min + 1) + min);
};
