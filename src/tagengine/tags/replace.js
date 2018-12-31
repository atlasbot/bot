const isSafeRe = require('safe-regex');
const TagError = require('../TagError');
const escapeRegex = require('../../../lib/utils/escapeRegex');

module.exports = async (context, [string, search, replacement]) => {
	if (!string || !search || !replacement) {
		throw new TagError('"string", "search" and "replacement" are required.');
	}

	if (isSafeRe(search)) {
		try {
			const regex = new RegExp(search, 'ig');

			if (regex) {
				return string.replace(regex, replacement);
			}
		} catch (e) {} // eslint-disable-line no-empty
	}

	// safe case insensitive replace
	const safe = escapeRegex(search);
	const regex = new RegExp(safe, 'ig');

	return string.replace(regex, replacement);
};

module.exports.info = {
	name: 'replace',
	args: '<string> <search> <replacement>',
	description: 'Replaces <search> in <string> with <replacement>, now with extra regexp flavour.',
	examples: [{
		input: '{replace;kittens are the best;kittens;puppies}',
		output: 'puppies are the best',
	}, {
		input: '{replace;Kittens are the best;kittens;puppies}',
		output: 'puppies are the best',
		note: 'Note the capitalized "Kittens". {replace} is case-insensitive.',
	}, {
		input: '{replace;The quick brown fox jumped over the lazy fox;([A-z]+);($1)}',
		output: '(The) (quick) (brown) (fox) (jumped) (over) (the) (lazy) (fox)',
		note: 'This example uses regular expressions, essentially surrounding groups of a-z in (). Google is your friend, but chances are you should just leave this alone if you don\'t understand interface.',
	}],
	dependencies: [],
};
