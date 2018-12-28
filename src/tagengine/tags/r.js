module.exports = () => '}';

module.exports.info = {
	name: 'r',
	description: 'A right }, incase you need one and don\'t want the parser eating it up.',
	examples: [{
		input: '{r}',
		output: '}',
	}],
	dependencies: [],
};
