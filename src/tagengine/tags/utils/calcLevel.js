const getLevelFromXP = require('atlas-lib/lib/xputil/getLevelFromXP');
const TagError = require('../../TagError');

module.exports = async (context, [number]) => {
	number = context.Atlas.lib.utils.parseNumber(number);

	if (isNaN(number)) {
		throw new TagError('"number" should be a number');
	}

	return getLevelFromXP(number);
};

module.exports.info = {
	name: 'utils.calcLevel',
	args: '<number>',
	description: 'Gets a level from an XP count.',
	examples: [{
		input: '{utils.calcLevel;1337}',
		output: '5',
	}],
	dependencies: [],
};
