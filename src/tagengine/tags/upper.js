const TagError = require('./../TagError');

module.exports = (info, [str]) => {
	if (!str) {
		throw new TagError('A string must be provided to {upper}.');
	}

	return str.toUpperCase();
};

module.exports.info = {
	name: 'upper',
	description: 'Converts a string to uppercase.',
	examples: [{
		input: '{upper;test}',
		output: 'TEST',
	}],
	dependencies: [],
};
