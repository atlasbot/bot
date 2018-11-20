const Util = require('../../../util');
const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	channel,
	...randomData
}, args, ...randomShit) => {
	if (args[argIndex]) {
		const util = new Util();

		// try and resolve the user cus why not
		channel = await util.findRoleOrChannel(guild, args[argIndex], {
			type: 'channel',
		});

		if (!channel) {
			throw new TagError('Invalid user query.');
		}
	}


	return func({
		guild,
		channel,
		...randomData,
	}, args, ...randomShit);
};
