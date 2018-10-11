/**
 * Gets the type of channel from a number.
 * @param {number} type The type between 0 and 4.
 * @returns {string} The channel name type, e.g "text" or "category"
 */
module.exports = (type) => {
	switch (type) {
		case 0:
			return 'text';
		case 1:
			return 'dm';
		case 2:
			return 'voice';
		case 3:
			return 'group dm';
		case 4:
			return 'category';
		default:
			return 'text';
	}
};
