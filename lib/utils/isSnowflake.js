const DISCORD_EPOCH = 1420070400000;

/* eslint-disable no-bitwise */

/**
 * Checks whether a snowflake is valid or not
 * @param {number|string} snowflake The snowflake to verify
 * @returns {boolean} Whether or not the snowflake is valid
 */
module.exports = (snowflake) => {
	if (isNaN(snowflake) || !/[0-9]{15,25}/.test(snowflake)) {
		// no numbers/mixed numbers
		return;
	}

	const timestamp = module.exports.getTime(snowflake);

	// the timestamp sure as shit can't be from the future (also adds 60s to account for weirdness on discord's part)
	if (timestamp < (Date.now() + 60000)) {
		return timestamp;
	}
};

module.exports.getTime = snowflake => module.exports.sinceEpoch(snowflake) + DISCORD_EPOCH;

module.exports.sinceEpoch = snowflake => Math.floor((snowflake / 4194304));
