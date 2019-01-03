module.exports = (context, [string = '', query = '']) => string.toLowerCase().includes(query.toLowerCase());

module.exports.info = {
	name: 'utils.includes',
	args: '[string] [query]',
	description: 'Returns true or false if [string] includes [query].',
	examples: [{
		input: '{utils.includes;a string;string}',
		output: 'true',
	}, {
		input: '{utils.includes;AN UPPERCASE STRING;uppercase}',
		output: 'true',
	}],
	dependencies: [],
};
