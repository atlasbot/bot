/**
 * Checks whether a snowflake is valid or not
 * @param {number|string} snowflake The snowflake to verify
 * @returns {boolean} Whether or not the snowflake is valid
 */
module.exports = (snowflake) => {
	if (isNaN(snowflake)) {
		return false;
	}
	const timestamp = module.exports.getTime(snowflake);
	console.log(snowflake, timestamp);
	// 1420070400000 is time since discord epoch, +1 is because it gets rid of most fake snowflakes
	if (timestamp > 1420070400001 && timestamp <= 3619093655551) {
		return true;
	}

	return false;
};
module.exports.getTime = (snowflake) => {
	const num = Number(snowflake);

	return (num / 4194304) + 1420070400000;
};
