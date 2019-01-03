const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	user,
	Atlas,
	parseArgs,
	...context
}, args, ...randomShit) => {
	if (args[argIndex]) {
		let arg = args[argIndex];

		if (typeof arg !== 'string') {
			arg = await parseArgs(arg);
		}

		// try and resolve the user cus why not
		user = await Atlas.util.findMember(guild, arg, {
			// why the fuck is it called findMember if it doesn't always return a member? past sylver, explain pls
			memberOnly: true,
		});

		if (!user) {
			throw new TagError('No user matching your search');
		}
	}


	return func({
		guild,
		user,
		Atlas,
		parseArgs,
		...context,
	}, args, ...randomShit);
};
