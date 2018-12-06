module.exports = ({ guild }) => guild.shard.id;

module.exports.info = {
	name: 'guild.shard',
	description: 'Gets the guild\'s shard ID. I can\'t think of any circumstance where you would need this.',
	examples: [{
		input: '{guild.shard}',
		output: '6',
	}],
	dependencies: ['guild'],
};
