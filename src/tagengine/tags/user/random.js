module.exports = ({ guild }) => guild.members.random().user.id;

module.exports.info = {
	name: 'user.random',
	description: 'Gets the ID of a random user.',
	examples: [{
		input: '{user.random}',
		output: '111372124383428608',
	}, {
		input: 'I pick you, {user.tag;{user.random}}!',
		output: 'I pick you, Sylver#1058!',
	}],
	dependencies: ['user', 'guild'],
};
