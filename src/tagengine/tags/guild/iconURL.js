module.exports = ({ guild }) => guild.iconURL;

module.exports.info = {
	name: 'guild.iconURL',
	description: 'Gets a total count of all the channels in the guild.',
	examples: [{
		input: '{guild.channelCount}',
		output: '11',
	}],
	dependencies: ['guild'],
};
