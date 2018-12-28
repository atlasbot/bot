module.exports = (context, [string]) => {
	if (string) {
		return string.toLowerCase();
	}
};

module.exports.info = {
	name: 'lower',
	args: '<string>',
	description: 'Converts a string to lowercase.',
	examples: [{
		input: '{lower;NOW THIS IS EPIC}',
		output: 'now this is epic',
	}],
	dependencies: [],
};
