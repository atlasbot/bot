const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	user,
	Atlas,
	...randomData
}, args, ...randomShit) => {
	if (args[argIndex]) {
		// try and resolve the user cus why not
		user = await Atlas.util.findMember(guild, args[argIndex], {
			// why the fuck is it called findMember if it doesn't always return a member? past sylver, explain pls
			memberOnly: true,
		});

		if (!user) {
			throw new TagError('Invalid user query.');
		}
	}


	return func({
		guild,
		user,
		Atlas,
		...randomData,
	}, args, ...randomShit);
};
