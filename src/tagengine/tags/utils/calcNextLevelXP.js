const TagError = require('../../TagError');
const getUserXPProfile = require('../../../../lib/xputil/getUserXPProfile');

module.exports = async (context, [number]) => {
	number = context.Atlas.lib.utils.parseNumber(number);

	if (isNaN(number)) {
		throw new TagError('"number" should be a number');
	}

	const { next: { xp } } = getUserXPProfile(number);

	return xp;
};

module.exports.info = {
	name: 'utils.calcNextLevelXP',
	args: '<number>',
	description: 'Calculates the XP the next level requires, where <number> is the amount of XP the user has.',
	examples: [{
		input: '{utils.calcNextLevelXP;1337}',
		output: '1380',
	}],
	dependencies: [],
};
