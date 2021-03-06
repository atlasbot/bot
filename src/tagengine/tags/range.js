const randomInt = require('atlas-lib/lib/utils/randomInt');
const parseNumber = require('atlas-lib/lib/utils/parseNumber');
const TagError = require('../TagError');

module.exports = async (x, [min, max]) => {
	if (!min) {
		throw new TagError('No minimum value');
	}

	min = parseNumber(min);

	if (isNaN(min)) {
		throw new TagError('Minimum must be a number.');
	}

	max = parseNumber(max);

	if (max && isNaN(max)) {
		throw new TagError('Maximum must be a number.');
	}

	return randomInt(Number(min), Number(max));
};

module.exports.info = {
	name: 'range',
	args: '[min] [max]',
	description: 'Gets a number between [min] and [max].',
	examples: [{
		input: '{range;5;10}',
		output: '7',
	}, {
		input: '{range;0;100}',
		output: '69',
	}],
	dependencies: [],
};
