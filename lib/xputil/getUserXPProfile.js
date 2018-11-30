const getLevelFromXP = require('./getLevelFromXP');
const getLevelXP = require('./getLevelXP');
/*
	Ported directly from v7 for compatibility, will be replaced when i have time (hopefully).
*/

module.exports = (totalXP) => {
	const level = getLevelFromXP(totalXP);

	const remaining = totalXP - getLevelXP(level);

	const levelXP = getLevelXP(level);

	const next = level + 1;

	const nextXP = getLevelXP(level + 1);

	return {
		total: totalXP,
		remaining,
		current: {
			level,
			xp: levelXP,
		},
		next: {
			level: next,
			xp: nextXP,
		},
	};
};
