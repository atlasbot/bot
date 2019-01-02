const pickOne = require('../../../lib/utils/pickOne');

module.exports = async (x, options) => {
	if (!options.length) {
		return options[0];
	}

	return pickOne(options);
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
	dependencies: [],
};
