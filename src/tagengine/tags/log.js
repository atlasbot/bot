// todo: parse then check instead of parsing all of them then checking each one

module.exports = async (ctx, raw) => {
	if (process.env.NODE_ENV !== 'development') {
		return;
	}

	console.log(raw.join(' '));
};

module.exports.info = {
	name: 'log',
	args: '<string>',
	description: 'Logs <string>',
	private: true,
	dependencies: [],
};
