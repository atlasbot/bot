const TagError = require('../../TagError');
const getUserXPProfile = require('../../../../lib/xputil/getUserXPProfile');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
	}

	const { remaining } = getUserXPProfile(number);

	return remaining;
};

module.exports.info = {
	name: 'utils.calcRemainingXP',
	args: '<number>',
	description: 'Calculates the remaining XP to level up, where <number> is the amount of XP the user has.',
	examples: [{
		input: '{utils.calcRemainingXP;1337}',
		output: '462',
	}],
	dependencies: [],
};
