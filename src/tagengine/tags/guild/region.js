const cleanRegion = require('atlas-lib/lib/utils/cleanRegion');

module.exports = ({ guild }) => cleanRegion(guild.region);

module.exports.info = {
	name: 'guild.region',
	description: 'The region of the guild, e.g \'US East\'.',
	examples: [{
		input: '{guild.region}',
		output: 'US West',
		note: 'This assumes the guild is in the "US West" region',
	}],
	dependencies: ['guild'],
};
