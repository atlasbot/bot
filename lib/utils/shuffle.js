/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * @returns {Array} The shuffled array
 */
module.exports = (a) => {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}

	return a;
};
