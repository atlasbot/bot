module.exports = ({ guild }) => guild.memberCount;

module.exports.info = {
	name: 'guild.memberCount',
	description: 'Gets the total number of members in the server.',
	examples: [{
		input: '{guild.memberCount}',
		output: '69',
	}],
	dependencies: ['guild'],
};
