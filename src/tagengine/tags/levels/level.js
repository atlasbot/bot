const TagError = require('../../TagError');
const getUserXPProfile = require('../../../../lib/xputil/getUserXPProfile');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
	}

	const { current: { level } } = getUserXPProfile(number);

	return level;
};

module.exports.info = {
	name: 'levels.level',
	args: '<number>',
	description: 'Gets a level from an XP count.',
	examples: [{
		input: '{levels.level;1337}',
		output: '5',
	}],
	dependencies: [],
};
