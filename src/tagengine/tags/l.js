module.exports = () => '{';

module.exports.info = {
	name: 'l',
	description: 'A left {, incase you need one and don\'t want the parser eating it up.',
	examples: [{
		input: '{l}',
		output: '{',
	}],
	dependencies: [],
};
