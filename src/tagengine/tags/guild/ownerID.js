module.exports = ({ guild }) => guild.ownerID;

module.exports.info = {
	name: 'guild.ownerID',
	description: 'Gets the ID of the owner.',
	examples: [{
		input: '{guild.ownerID}',
		output: '111372124383428608',
	}, {
		input: '{user.username;{guild.ownerID}}',
		output: 'Sylver',
	}],
	dependencies: ['guild'],
};
