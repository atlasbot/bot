const TagError = require('../TagError');

module.exports = async ({ persistent }, [key, value]) => {
	if (!key) {
		throw new TagError('"key" is required.');
	}

	if (persistent.size > 5000) {
		throw new TagError('Your persistent storage has exceeded your quota (5000 keys). Contact Atlas Support if you would like these limits raised.');
	}

	if (!value) {
		console.log('deleting');

		persistent.delete(key);
	} else {
		persistent.set(key, value);
	}
};

module.exports.info = {
	name: 'perset',
	args: '<key> <value>',
	description: 'Sets a key to a value in persistent storage. ',
	examples: [{
		input: '{perset;key;value}',
		output: '',
	}, {
		input: '{perset;key;value} {perget;key}',
		output: 'value',
	}, {
		input: '{perset;key}',
		output: '',
		note: 'To delete a key.',
	}],
	dependencies: [],
};
