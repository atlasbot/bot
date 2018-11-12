module.exports = ({ settings }) => settings.prefix || process.env.DEFAULT_PREFIX;

module.exports.info = {
	name: 'guild.prefix',
	description: 'Gets the guild prefix.',
	examples: [{
		input: '{guild.prefix}',
		output: 'a!',
	}],
	dependencies: ['settings'],
};
