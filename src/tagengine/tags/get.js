const TagError = require('../TagError');

module.exports = async ({ volatile }, [key]) => {
	if (!key) {
		throw new TagError('Please include a storage key (see docs.atlasbot.xyz)');
	}

	return volatile.get(key);
};

module.exports.info = {
	name: 'get',
	args: '<key>',
	description: 'Gets a key from volatile storage. If you want full persistence, look at "perset" and "perget".',
	examples: [{
		input: '{set;key;value} {get;key}',
		output: 'value',
	}],
	dependencies: [],
};
