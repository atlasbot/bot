const compare = require('string-similarity').compareTwoStrings;
const { getNested } = require('./../../lib/utils');

/** Searches an array for a result using levenshtein's algorithm */
class Fuzzy {
	/**
	 * Setup the fuzzy searcher
	 * @param {Object[]} haystack The array to search
	 * @param {string[]} keys The object keys to use
	 * @param {Object} options The options to use
	 * @param {boolean} options.caseSensitive Whether or not the search is case sensitive
	 * @param {boolean} options.returnAll Whether or not to return all the results with their score instead of returning the one with the best score
	 * @param {number} options.matchPercent the required match percent to be a possible valid result
	 */
	constructor(haystack = [], {
		returnAll = false,
		matchPercent = 0.75,
		keys = [],
	} = {}) {
		if (!haystack || !(haystack instanceof Array)) {
			throw new Error('We need an array containing the search list');
		}

		this.haystack = haystack;
		this.keys = keys;
		this.returnAll = returnAll;
		this.matchPercent = matchPercent;
	}

	/**
	 * Execute the fuzzy search
	 * @param {string} [query=void] The query to search for
	 * @returns {void|Object} The result that was found
	 */
	search(query = '') {
		if (query === '') {
			return;
		}
		const processed = [];

		if (!this.haystack) return;

		for (let i = 0; i < this.haystack.length; i++) {
			const item = this.haystack[i];

			if (this.keys.length === 0) {
				const score = compare(item.toLowerCase(), query.toLowerCase());

				if (score) {
					processed.push({ item, score });
				}
			} else {
				for (let y = 0; y < this.keys.length; y++) {
					const prop = getNested(item, this.keys[y]);

					if (prop) {
						if (prop instanceof Array) {
							for (const a of prop) {
								const score = compare(a.toLowerCase(), query.toLowerCase());

								processed.push({ item, score });
							}
						} else if (typeof prop === 'string') {
							const score = compare(prop.toLowerCase(), query.toLowerCase());

							processed.push({ item, score });
						}
					}
				}
			}
		}

		if (this.returnAll) {
			return processed;
		} if (processed.find(i => i.score >= this.matchPercent)) {
			// Return the one "close enough"
			const best = processed.reduce((prev, curr) => (prev.score > curr.score ? prev : curr));

			return best.item;
		}
	}
}

module.exports = Fuzzy;
