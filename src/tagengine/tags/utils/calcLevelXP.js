const TagError = require('../../TagError');
const getLevelXP = require('../../../../lib/xputil/getLevelXP');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
	}

	return getLevelXP(number);
};

module.exports.info = {
	name: 'utils.calcLevelXP',
	args: '<number>',
	description: 'Gets a level from an amount of XP.',
	examples: [{
		input: '{utils.calcLevelXP;1337}',
		output: '5',
	}],
	dependencies: [],
};
