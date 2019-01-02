const TagError = require('./../../TagError');

module.exports = (func, argIndex = 0) => async ({
	guild,
	Atlas,
	...context
}, args, ...randomShit) => {
	// try and resolve the user cus why not
	const role = await Atlas.util.findRoleOrChannel(guild, args[argIndex], {
		type: 'role',
	});

	if (!role) {
		throw new TagError('Invalid role query.');
	}

	// first arg is the role name
	args.shift();

	return func({
		role,
		guild,
		Atlas,
		...context,
	}, args, ...randomShit);
};
