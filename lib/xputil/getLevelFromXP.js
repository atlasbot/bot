const getLevelXP = require('./getLevelXP');
/*
	Ported directly from v7 for compatibility, will be replaced when i have time (hopefully).
*/

/**
 * Gets a users level from their XP count
 * @param {number} xp The amount of XP the user has.
 * @returns {number} The users level
 */
module.exports = (xp) => {
	let i = 0;

	while (getLevelXP(i) <= xp) {
		i++;
	}

	return i < 0 ? 0 : i - 1;
};
