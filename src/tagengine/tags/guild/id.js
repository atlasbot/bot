module.exports = ({ guild }) => guild.id;

module.exports.info = {
	name: 'guild.id',
	description: 'Gets the guild ID.',
	examples: [{
		input: '{guild.id}',
		output: '345177567541723137',
	}],
	dependencies: ['guild'],
};
