const TagError = require('../../TagError');
const getLevelFromXP = require('../../../../lib/xputil/getLevelFromXP');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
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
