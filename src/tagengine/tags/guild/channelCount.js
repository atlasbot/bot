module.exports = ({ guild }) => guild.channels.size;

module.exports.info = {
	name: 'guild.channelCount',
	description: 'Gets a total count of all the channels in the guild.',
	examples: [{
		input: '{guild.channelCount}',
		output: '11',
	}],
	dependencies: ['guild'],
};
