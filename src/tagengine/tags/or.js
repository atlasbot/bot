// todo: parse then check instead of parsing all of them then checking each one

module.exports = async (info, args) => args.find(a => !!a.trim());

module.exports.info = {
	name: 'or',
	args: '*',
	description: 'Returns the first argument that exist and is not empty.',
	examples: [{
		input: '{or;; ;test}',
		output: 'test',
	}, {
		input: '{or;first;second}',
		output: 'first',
	}],
	dependencies: [],
};
