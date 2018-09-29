const constants = require('./../constants');

module.exports.toggleType = (str, _throw = true) => {
	const clean = str.trim().toLowerCase();

	if (constants.enableWords.includes(clean)) {
		return true;
	}

	if (constants.disableWords.includes(clean)) {
		return false;
	}

	if (_throw) {
		throw new Error('Unknown type.');
	}
};
