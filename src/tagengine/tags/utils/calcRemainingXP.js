const getUserXPProfile = require('atlas-lib/lib/xputil/getUserXPProfile');
const TagError = require('../../TagError');

module.exports = async (context, [number]) => {
	number = context.Atlas.lib.utils.parseNumber(number);

	if (isNaN(number)) {
		throw new TagError('"number" should be a number');
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
