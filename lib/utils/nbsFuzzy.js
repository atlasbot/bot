const Fuzzy = require('../structures/Fuzzy');

// no bullshit fuzzy searching, basically a shortcut because lazy
module.exports = (array, keys, query) => (new Fuzzy(array, {
	keys,
})).search(query);
