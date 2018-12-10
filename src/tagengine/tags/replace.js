const TagError = require('../TagError');
const escapeRegex = require('../../../lib/utils/escapeRegex');

module.exports = async (context, [string, phrase, replacement]) => {
	if (!string || !phrase || !replacement) {
		throw new TagError('"string", "phrase" and "replacement" are required.');
	}

	// safe case insensitive replace
	const safe = escapeRegex(phrase);
	const regex = new RegExp(safe, 'ig');

	return string.replace(regex, replacement);
};

module.exports.info = {
	name: 'replace',
	args: '<string> <search> <replacement>',
	description: 'Returns a random argument.',
	examples: [{
		input: '{replace;kittens are the best;kittens;puppies}',
		output: 'puppies are the best',
	}, {
		input: '{replace;Kittens are the best;kittens;puppies}',
		output: 'puppies are the best',
		note: 'Note the capitalized "Kittens". {replace} is case-insensitive.',
	}],
	dependencies: [],
};
