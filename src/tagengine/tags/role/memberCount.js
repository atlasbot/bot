const middleware = require('./middleware');

module.exports = middleware(({ role, guild }) => guild.members.filter(m => m.roles.includes(role.id)).length);

module.exports.info = {
	name: 'role.memberCount',
	description: 'Gets the amount of members in a role. **This can be wildly inaccurate for larger (>250 member) servers.**',
	args: '[role]',
	examples: [{
		input: '{role.memberCount;Developer}',
		output: '1',
	}],
	dependencies: ['guild'],
};
