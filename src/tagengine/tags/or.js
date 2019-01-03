// todo: parse then check instead of parsing all of them then checking each one

module.exports = async ({ parseArgs }, raw) => {
	for (const arg of raw) {
		const parsed = await parseArgs(arg);

		if (parsed.trim()) {
			return parsed;
		}
	}
};

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
	dontParse: true,
	dependencies: [],
};
