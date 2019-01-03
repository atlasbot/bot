const getUserXPProfile = require('atlas-lib/lib/xputil/getUserXPProfile');
const TagError = require('../../TagError');

module.exports = async (context, [number]) => {
	number = context.Atlas.lib.utils.parseNumber(number);

	if (isNaN(number)) {
		throw new TagError('"number" should be a number');
	}

	const { next: { level } } = getUserXPProfile(number);

	return level;
};

module.exports.info = {
	name: 'utils.calcNextLevel',
	args: '<number>',
	description: 'Gets the users next level from their XP.',
	examples: [{
		input: '{utils.calcNextLevel;1337}',
		output: '6',
	}],
	dependencies: [],
};
