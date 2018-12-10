module.exports = ({ guild }) => guild.icon;

module.exports.info = {
	name: 'guild.icon',
	description: 'Gets the guild icon hash. You probably want {guild.iconURL}!',
	examples: [{
		input: '{guild.icon}',
		output: '09a95ea8970f07636addbd6f3baaa6e4',
	}],
	dependencies: ['guild'],
};
