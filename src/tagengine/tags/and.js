// todo: parse then check instead of parsing all of them then checking each one

module.exports = async ({ parseArgs }, raw) => {
	for (const arg of raw) {
		const parsed = await parseArgs(arg);

		if (!parsed.trim()) {
			return 'false';
		}
	}

	return 'true';
};

module.exports.info = {
	name: 'and',
	args: '*',
	description: 'Returns "true" if all args are present, or "false" in any other circumstance.',
	examples: [{
		input: '{and;; ;test}',
		output: 'false',
	}, {
		input: '{or;first;second}',
		output: 'true',
	}, {
		input: '{and;false;false}',
		output: 'true',
		note: 'Booleans are not parsed.',
	}],
	dontParse: true,
	dependencies: [],
};
