/**
 * Gets a nested object value.
 * @param {Object} obj The object to get the key from
 * @param {string|array<string>} keys The key to get, split at dots.
 * @returns {*} The value, if it gets stuck at a key it will return where it got stuck.
 */
module.exports = (obj, keys) => {
	if (!Array.isArray(keys)) {
		return module.exports(obj, keys.split('.'));
	}
	const key = keys.shift();

	if (key && obj[key]) {
		return module.exports(obj[key], keys);
	}

	return obj;
};
