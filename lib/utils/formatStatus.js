/**
 * Formats a Discord status into a cleaner name, e.g "dnd" => "Do not Disturb"
 * @param {string} status The status, e.g "dnd" or "online"
 * @returns {string} The formatted status, e.g "Do not Disturb" or "Online"
 */
module.exports = (status) => {
	const v = module.exports.statuses.find(c => c.name === status);
	if (v) {
		return v.alias;
	}

	return '???';
};

module.exports.statuses = [
	{
		name: 'online',
		alias: 'Online',
	},
	{
		name: 'idle',
		alias: 'Idle',
	},
	{
		name: 'dnd',
		alias: 'Do Not Disturb',
	},
	{
		name: 'offline',
		alias: 'Offline',
	},
];
