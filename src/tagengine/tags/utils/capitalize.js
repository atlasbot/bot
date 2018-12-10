const TagError = require('../../TagError');
const capitalize = require('../../../../lib/utils/capitalize');

module.exports = async (x, [string]) => {
	if (!string) {
		throw new TagError('"string" is required.');
	}

	return capitalize(string);
};

module.exports.info = {
	name: 'utils.capitalize',
	args: '<string>',
	description: 'Returns true if the input is a valid Discord snowflake, or false for any other circumstance. This does not mean the snowflake is definitely used by something, just that it could be in use or used in the future.',
	examples: [{
		input: '{utils.isSnowflake;111372124383428608}',
		output: 'true',
	}, {
		input: '{utils.isSnowflake;awd}',
		output: 'false',
	}, {
		input: '{utils.isSnowflake;}',
		output: 'false',
	}, {
		input: '{utils.isSnowflake;{user.id}}',
		output: 'true',
	}],
	dependencies: [],
};
