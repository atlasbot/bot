const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	user,
	Atlas,
	parseArg,
	...context
}, args, ...randomShit) => {
	if (args[argIndex]) {
		let arg = args[argIndex];

		if (typeof arg !== 'string') {
			arg = await parseArg(arg);
		}

		// try and resolve the user cus why not
		const member = await Atlas.util.findUser(guild, arg, {
			// why the fuck is it called findUser if it doesn't always return a member? past sylver, explain pls
			memberOnly: true,
		});

		if (!member) {
			throw new TagError('No user matching your search');
		}

		({ user } = member);
	}


	return func({
		guild,
		user,
		Atlas,
		parseArg,
		...context,
	}, args, ...randomShit);
};
