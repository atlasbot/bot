const Util = require('../../../util');
const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	user,
	...randomData
}, args, ...randomShit) => {
	if (args[argIndex]) {
		const util = new Util();

		// try and resolve the user cus why not
		user = await util.findMember(guild, args[argIndex], {
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
		...randomData,
	}, args, ...randomShit);
};
