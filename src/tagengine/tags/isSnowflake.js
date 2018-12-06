const isSnowflake = require('../../../lib/utils/isSnowflake');

module.exports = async (x, [str]) => !!isSnowflake(str);

module.exports.info = {
	name: 'isSnowflake',
	args: '<string>',
	description: 'Returns true if the input is a valid Discord snowflake, or false for any other circumstance. This does not mean the snowflake is definitely used by something, just that it could be in use or used in the future.',
	examples: [{
		input: '{isSnowflake;111372124383428608}',
		output: 'true',
	}, {
		input: '{isSnowflake;awd}',
		output: 'false',
	}, {
		input: '{isSnowflake;}',
		output: 'false',
	}, {
		input: '{isSnowflake;{user.id}}',
		output: 'true',
	}],
	dependencies: [],
};
