const isSnowflake = require('./utils/isSnowflake');

// mongo validation for discord snowflakes (111372124383428608), not perfect but pretty close.
module.exports = {
	type: String,
	// fixes mongoose weirdnesss
	default: null,
	validate: {
		validator: id => isSnowflake(id),
		message: '{VALUE} is not a valid snowflake!',
	},
};
