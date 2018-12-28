const TagError = require('../TagError');

module.exports = async ({ persistent }, [key]) => {
	if (!key) {
		throw new TagError('"key" is required.');
	}

	return persistent.get(key);
};

module.exports.info = {
	name: 'perget',
	args: '<key>',
	description: 'Gets a key from persistent storage.',
	examples: [{
		input: '{perset;key;value} {perget;key}',
		output: 'value',
	}],
	dependencies: [],
};
