const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(async ({ user, settings, guild, Atlas }, [roleQuery]) => {
	const member = await settings.findMember(user.id, {
		memberOnly: true,
	});

	if (!guild.me.permission.has('manageRoles')) {
		throw new TagError('Atlas cannot assign roles without the "Manage Roles" permission.');
	}

	if (!roleQuery) {
		throw new TagError('You must include a role search.');
	}

	const role = await Atlas.util.findRoleOrChannel(guild, roleQuery, {
		type: 'role',
	});

	if (!role) {
		throw new TagError('Could not find a role matching your query (fuzzy)');
	}

	if (member.roles.includes(role.id)) {
		return;
	}

	if (role.higherThan(guild.me.highestRole)) {
		throw new TagError('Atlas cannot assign roles higher than it in role hierarchy.');
	}

	await member.addRole(role.id);
}, 1);

module.exports.info = {
	name: 'user.addrole',
	description: 'Gives a user a role. Role is matched using a fuzzy matcher.',
	args: '[role id/name/mention] <user>',
	examples: [{
		input: '{user.addrole;Humans}',
		output: '',
		note: 'The user would have the role. Returns nothing on success.',
	}, {
		input: '{user.addrole;Humans;Sylver}',
		output: '',
		note: 'Sylver would now have the "Humans" role.',
	}],
	dependencies: ['user', 'guild', 'settings'],
};
