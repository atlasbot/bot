const TagError = require('../../TagError');
const getUserXPProfile = require('../../../../lib/xputil/getUserXPProfile');

module.exports = async (x, [number]) => {
	if (!isFinite(number)) {
		throw new TagError('Invalid XP number');
	}

	const { next: { level } } = getUserXPProfile(number);

	return level;
};

module.exports.info = {
	name: 'levels.nextLevel',
	args: '<number>',
	description: 'Gets the users next level from their XP.',
	examples: [{
		input: '{levels.nextLevel;1337}',
		output: '6',
	}],
	dependencies: [],
};
