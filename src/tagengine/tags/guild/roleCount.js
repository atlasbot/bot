module.exports = ({ guild }) => guild.roles.size;

module.exports.info = {
	name: 'guild.roleCount',
	description: 'Gets a total count of all the roles in the guild.',
	examples: [{
		input: '{guild.roleCount}',
		output: '7',
	}],
	dependencies: ['guild'],
};
