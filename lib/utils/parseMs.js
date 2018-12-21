/**
 * Converts milliseconds to an object with days, hours, minutes, seconds, milliseconds.
 * @param {number} ms The milliseconds to do magic with
 * @returns {Object} An object with the stuffs
 */
module.exports = (ms) => {
	if (typeof ms !== 'number' || !isFinite(ms)) {
		throw new TypeError('Expected a finite number');
	}

	return {
		days: Math.round(ms / 86400000),
		hours: Math.round(ms / 3600000) % 24,
		minutes: Math.round(ms / 60000) % 60,
		seconds: Math.round(ms / 1000) % 60,
		milliseconds: Math.round(ms) % 1000,
	};
};
