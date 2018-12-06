module.exports = ({ guild: { defaultNotifications } }) => (defaultNotifications === 0 ? 'All Messages' : 'Only @mentions');

module.exports.info = {
	name: 'guild.defaultNotifications',
	description: 'Gets the default notification level for the guild.',
	examples: [{
		input: '{guild.defaultNotifications}',
		output: 'Only @mentions',
		note: 'Output can be either "Only @mentions" or "All Messages".',
	}],
	dependencies: ['guild'],
};
