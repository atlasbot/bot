const getLevelFromXP = require('./getLevelFromXP');
const getLevelXP = require('./getLevelXP');

module.exports = (totalXP) => {
	const level = getLevelFromXP(totalXP);

	const levelXP = getLevelXP(level);

	const next = level + 1;

	const nextXP = getLevelXP(level + 1);

	// xp towards the next level
	const completed = (totalXP - getLevelXP(level));
	const remaining = nextXP - completed;

	return {
		total: totalXP,
		remaining,
		current: {
			level,
			xp: levelXP,
		},
		next: {
			completed,
			level: next,
			xp: nextXP,
		},
	};
};
