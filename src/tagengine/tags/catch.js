const TagError = require('./../TagError');

module.exports = (info, [subcontent, message], {
	errors,
}) => {
	if (!message) {
		throw new TagError('Message is required.');
	}

	if (errors.length) {
		return message;
	}

	return subcontent;
};

module.exports.info = {
	name: 'catch',
	args: '[subtag(s)] [message]',
	description: 'If an error occures on any of the subtags, it will retun [message] instead of throwing an error. Please keep in mind this will still report the error as usual.',
	examples: [{
		input: '{catch;{throw;test};Something bad happened :c}',
		output: 'Something bad happened :c',
	}],
	dependencies: [],
};
