const TagError = require('../TagError');

module.exports = async ({ volatile }, [key, value]) => {
	if (!key) {
		throw new TagError('"key" is required.');
	}

	volatile.set(key, value);
};

module.exports.info = {
	name: 'set',
	args: '<key> <value>',
	description: 'Sets a key to a value in volatile storage, used for storing things. If you want full persistence, look into "perset" and "perget"',
	examples: [{
		input: '{set;key;value}',
		output: '',
	}, {
		input: '{set;key;value} {get;key}',
		output: 'value',
	}],
	dependencies: [],
};
