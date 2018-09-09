const Snowflake = require('./../structures/Snowflake');

/**
 * Checks whether a snowflake is valid or not
 * @param {number|string} snowflake The snowflake to verify
 * @returns {boolean} Whether or not the snowflake is valid
 */
module.exports = (snowflake) => {
	if (isNaN(snowflake)) {
		return false;
	}
	snowflake = Snowflake.deconstruct(snowflake);
	const { timestamp } = snowflake;
	if (timestamp > 1420070400000 && timestamp <= 3619093655551) {
		return true;
	}

	return false;
};
