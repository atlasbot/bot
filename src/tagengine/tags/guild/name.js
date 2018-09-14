module.exports = ({ guild }) => guild.name;

module.exports.info = {
	name: 'guild.name',
	description: 'Gets the name of the guild.',
	examples: [{
		input: '{guild.name}',
		output: 'My Server',
		note: 'This assumes the name of the guild is "My Server"',
	}],
	dependencies: ['guild'],
};
