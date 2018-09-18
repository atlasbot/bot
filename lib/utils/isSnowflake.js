/**
 * Checks whether a snowflake is valid or not
 * @param {number|string} snowflake The snowflake to verify
 * @returns {boolean} Whether or not the snowflake is valid
 */
const DISCORD_EPOCH = 1420070400000;
module.exports = (snowflake) => {
	// if the snowflake is actually a number
	if (!isNaN(snowflake)) {
		// convert the snowflake to the time it was created
		const timestamp = module.exports.getTime(snowflake);
		// 1420070400000 is time since discord epoch, +1 is because it gets rid of most fake snowflakes
		if (timestamp > (DISCORD_EPOCH + 1)) {
			return true;
		}
	}
};

module.exports.getTime = snowflake => (Number(snowflake) / 4194304) + DISCORD_EPOCH;
