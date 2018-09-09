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
