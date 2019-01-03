const isSafeRe = require('safe-regex');
const escapeRegex = require('atlas-lib/lib/utils/escapeRegex');
const TagError = require('../TagError');

module.exports = async (context, [string, search = '']) => {
	if (!string) {
		throw new TagError('"target" is required.');
	}

	if (isSafeRe(search)) {
		try {
			const regex = new RegExp(search, 'ig');

			if (regex) {
				const match = string.match(regex);

				if (match) {
					return match.join(' ');
				}
			}
		} catch (e) {} // eslint-disable-line no-empty
	}

	// safe case insensitive replace
	const safe = escapeRegex(search);
	const regex = new RegExp(safe, 'ig');

	const match = string.match(regex);

	if (match) {
		return match.join(' ');
	}
};

module.exports.info = {
	name: 'find',
	args: '<target> <search>',
	description: 'Finds <search> in <target>, now with extra regexp flavour.',
	examples: [{
		input: '{find;This is a test;test}',
		output: 'test',
	}, {
		input: '{find;This does not include the forbidden word;test}',
		output: '',
	}, {
		input: '{find;This does not include the forbidden word;[d]+}',
		output: 'd d dd d',
		note: 'This will return all "d" characters in the string using regex.',
	}],
	dependencies: [],
};
