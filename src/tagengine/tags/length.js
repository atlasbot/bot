module.exports = (context, [string]) => {
	if (string) {
		return string.length;
	}
};

module.exports.info = {
	name: 'length',
	args: '<string>',
	description: 'Gets the length of a string.',
	examples: [{
		input: '{length;wew}',
		output: '3',
	}],
	dependencies: [],
};
