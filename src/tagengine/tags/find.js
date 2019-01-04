const isSafeRe = require('safe-regex');
const escapeRegex = require('atlas-lib/lib/utils/escapeRegex');
const TagError = require('../TagError');

module.exports = async ({ Atlas }, [string, search = '', group = '1', flags = 'i']) => {
	if (!string) {
		throw new TagError('"target" is required.');
	}

	group = Atlas.lib.utils.parseNumber(group);
	if (isNaN(group)) {
		throw new TagError('"group" must be a number');
	}

	if (isSafeRe(search)) {
		try {
			const regex = new RegExp(search, flags);

			if (regex) {
				const match = string.match(regex);

				if (match) {
					if (match[group] !== undefined) {
						return match[group];
					}

					return match.join(' ');
				}

				return;
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
	args: '<target> <search> <group> <flags=i>',
	description: 'Finds <search> in <target>, now with extra regexp flavour. <group> is an optional capture group to return when using regex. <flags> are any regex flags like "g" or "i", you can mix and match groups like "gi".',
	examples: [{
		input: '{find;This is a test;test}',
		output: 'test',
	}, {
		input: '{find;This does not include the forbidden word;test}',
		output: '',
	}, {
		input: '{find;The date is 07-08-2018;([0-9]{1,2})(?:/|-)([0-9]{1,2})(?:/|-)([0-9]{2,4});3}',
		output: '2018',
		note: 'Using some regex magic, this will match dates and return the year using the third capture group. This is an advanced example.',
	}],
	dependencies: [],
};
