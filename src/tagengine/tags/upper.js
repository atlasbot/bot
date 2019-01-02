module.exports = (info, [str = '']) => str.toUpperCase();

module.exports.info = {
	name: 'upper',
	args: '[string]',
	description: 'Converts a string to uppercase.',
	examples: [{
		input: '{upper;test}',
		output: 'TEST',
	}],
	dependencies: [],
};
