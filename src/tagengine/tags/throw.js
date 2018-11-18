const TagError = require('./../TagError');

module.exports = (info, [message]) => {
	if (!message) {
		throw new TagError('Message is required.');
	}

	throw new TagError(message);
};

module.exports.info = {
	name: 'throw',
	args: '[message]',
	description: 'Throws a TagError with whatever you want. Useful for testing or if you want better error handling in your actions.',
	examples: [{
		input: '{throw;Something bad happened}',
		output: '{throw-ERROR1}',
		note: 'You can handle the error properly with {catch}.On error Atlas will replace the tag with {<tagname>-ERROR<errorNumber>}.',
	}],
	dependencies: [],
};
