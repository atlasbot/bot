const middleware = require('./middleware');
const TagError = require('../../TagError');
const Util = require('../../../util');

module.exports = middleware(async ({ user, guild }, [roleQuery, exact = 'false']) => {
	const member = guild.members.get(user.id);
	const util = new Util();

	if (!guild.me.permission.has('manageRoles')) {
		throw new TagError('Atlas cannot remove roles without the "Manage Roles" permission.');
	}

	if (!roleQuery) {
		throw new TagError('You must include a role search.');
	}

	let role;
	if (exact === 'true') {
		const query = util.cleanID(roleQuery) || roleQuery;

		role = guild.roles.find(r => r.id === query || r.name === query);

		if (!role) {
			throw new TagError('Could not find a role matching your query (exact)');
		}
	} else {
		role = await util.findRoleOrChannel(guild, roleQuery, {
			type: 'role',
		});

		if (!role) {
			throw new TagError('Could not find a role matching your query (fuzzy)');
		}
	}

	if (!member.roles.includes(role.id)) {
		throw new TagError('User does not have that role.');
	}

	if (role.higherThan(guild.me.highestRole)) {
		throw new TagError('Atlas cannot remove roles higher than it in role hierarchy.');
	}

	await member.removeRole(role.id);
}, 2);

module.exports.info = {
	name: 'user.removerole',
	description: 'Removes a role from the user. When exact is true, Atlas will be strict and only search for a role that matches the name/ID exactly. Otherwise, Atlas will use the fuzzy searcher.',
	args: '[role id/name/mention]  <exact=false> <user>',
	examples: [{
		input: '{user.removerole;Humans}',
		output: '',
		note: 'The user would no longer have the role. Returns nothing on success.',
	}],
	dependencies: ['user', 'guild'],
};
