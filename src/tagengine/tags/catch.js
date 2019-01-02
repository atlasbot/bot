
module.exports = (info, [subcontent, message], {
	errors,
}) => {
	if (!message) {
		message = 'Something bad happened :c';
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
	}, {
		input: '{catch;{throw;test}}',
		output: 'Something bad happened :c',
		note: 'The default message is "Something bad happened :c"',
	}],
	dependencies: [],
};
