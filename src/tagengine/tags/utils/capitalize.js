const TagError = require('../../TagError');
const capitalize = require('../../../../lib/utils/capitalize');

module.exports = async (x, [string]) => {
	if (!string) {
		throw new TagError('"string" is required.');
	}

	return capitalize(string.trim());
};

module.exports.info = {
	name: 'utils.capitalize',
	args: '<string>',
	description: 'Capitalizes the first letter of a string.',
	examples: [{
		input: '{utils.capitalize;hehe epic}',
		output: 'Hehe epic',
	}],
	dependencies: [],
};
