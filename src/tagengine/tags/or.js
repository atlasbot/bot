module.exports = async (info, args) => args.find(a => !!a.trim());

module.exports.info = {
	name: 'or',
	args: '*',
	description: 'Returns the first argument that exist and is not empty.',
	examples: [{
		input: '{or;; ;test}',
		output: 'test',
	}],
	dependencies: [],
};
