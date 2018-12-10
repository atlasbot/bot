const Fuzzy = require('../structures/Fuzzy');

// no bullshit fuzzy searching, basically a shortcut because lazy
module.exports = (array, keys, query) => {
	if (array instanceof Map) {
		array = Array.from(array.values());
	}

	return (new Fuzzy(array, {
		keys,
	})).search(query);
};
