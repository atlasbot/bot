const parseNumber = require('../../../lib/utils/parseNumber');
const randomInt = require('../../../lib/utils/randomInt');
const TagError = require('../TagError');

module.exports = (context, [chars = 'abcdefghijklmnopqrstuvwxyz0123456789', length = '6']) => {
	const number = parseNumber(length);

	if (isNaN(number)) {
		throw new TagError('Invalid number.');
	}

	let result = '';
	for (let i = length; i > 0; --i) {
		result += chars[randomInt(chars.length)];
	}

	return result;
};

module.exports.info = {
	name: 'randstr',
	usage: '<string=a-z0-9> <length=6>',
	description: 'Creates a random string from the characters provided of <length>.',
	examples: [{
		input: '{randstr}',
		output: 'AuB9N4',
	}, {
		input: '{randstr;abc;2}',
		output: 'ac',
	}],
	dependencies: [],
};
