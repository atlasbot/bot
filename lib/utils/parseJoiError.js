module.exports = (error, {
	stripQuotes = false,
} = {}) => error.details.map((i) => {
	const err = {
		key: i.context.key,
		path: i.path.join('.'),
		message: stripQuotes ? i.message.replace(/"/g, '') : i.message,
		type: i.type.split('.').shift(),
		constraint: i.type.split('.').pop(),
	};

	// if label is different than key, provide label
	if (i.context.label !== err.key) {
		err.label = i.context.label;
	}

	return err;
});
