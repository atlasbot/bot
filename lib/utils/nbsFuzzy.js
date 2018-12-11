const Fuzzy = require('../structures/Fuzzy');

// no bullshit fuzzy searching, basically a shortcut because lazy

/**
 * No bullshit fuzzy searching.
 * @param {Array|Map} haystack The array/map of items to search in
 * @param {Array} keys Keys to check against <query>
 * @param {string} query The search term.
 * @param {Object} [options={}] Optional options to pass to the fuzzy searcher
 * @returns {Object|void}
 */
module.exports = (haystack, keys, query, options = {}) => {
	if (haystack instanceof Map) {
		haystack = Array.from(haystack.values());
	}

	return (new Fuzzy(haystack, {
		keys,
		...options,
	})).search(query);
};
