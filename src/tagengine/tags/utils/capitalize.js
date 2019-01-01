const capitalize = require('../../../../lib/utils/capitalize');

module.exports = async (x, [string = '']) => capitalize(string.trim());

module.exports.info = {
	name: 'utils.capitalize',
	// backwards compat
	aliases: ['capitalise'],
	args: '<string>',
	description: 'Capitalizes the first letter of a string.',
	examples: [{
		input: '{utils.capitalize;hehe epic}',
		output: 'Hehe epic',
	}],
	dependencies: [],
};
