const pickOne = require('atlas-lib/lib/utils/pickOne');

module.exports = async ({ parseArgs }, args) => {
	if (!args.length) {
		return;
	}

	return parseArgs(pickOne(args));
};

module.exports.info = {
	name: 'choose',
	args: '[...options]',
	description: 'Returns a random argument.',
	examples: [{
		input: '{choose;a;b}',
		output: 'a',
	}, {
		input: 'Cats are {choose;good;bad} mkay',
		output: 'Cats are bad mkay',
	}, {
		input: 'Doggos are {choose;good;good} mkay',
		output: 'Doggos are good mkay',
	}],
	dontParse: true,
	dependencies: [],
};
