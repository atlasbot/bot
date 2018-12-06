const TagError = require('../../TagError');
const getUserXPProfile = require('../../../../lib/xputil/getUserXPProfile');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
	}

	const { next: { xp } } = getUserXPProfile(number);

	return xp;
};

module.exports.info = {
	name: 'levels.nextLevelXP',
	args: '<number>',
	description: 'Calculates the XP the next level requires, where <number> is the amount of XP the user has.',
	examples: [{
		input: '{levels.nextLevelXP;1337}',
		output: '1380',
	}],
	dependencies: [],
};
