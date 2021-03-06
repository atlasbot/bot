const middleware = require('./middleware');
const TagError = require('../../TagError');

module.exports = middleware(async ({ user, guild, settings, Atlas }, [roleQuery]) => {
	const member = await settings.findUser(user.id, {
		memberOnly: true,
	});

	if (!guild.me.permission.has('manageRoles')) {
		throw new TagError('Atlas cannot remove roles without the "Manage Roles" permission.');
	}

	if (!roleQuery) {
		throw new TagError('You must include a role search.');
	}

	const role = await Atlas.util.findRoleOrChannel(guild, roleQuery, {
		type: 'role',
		percent: 0.90,
	});

	if (!role) {
		throw new TagError('Could not find a role matching your query (fuzzy)');
	}

	if (!member.roles.includes(role.id)) {
		return;
	}

	if (role.higherThan(guild.me.highestRole)) {
		throw new TagError('Atlas cannot remove roles higher than it in role hierarchy.');
	}

	await member.removeRole(role.id);
}, 1);

module.exports.info = {
	name: 'user.removerole',
	description: 'Removes a role from the user. Role is matched using a fuzzy matcher.',
	args: '[role id/name/mention] <user>',
	examples: [{
		input: '{user.removerole;Humans}',
		output: '',
		note: 'The user would no longer have the role. Returns nothing on success.',
	}],
	dependencies: ['user', 'guild', 'settings'],
};
