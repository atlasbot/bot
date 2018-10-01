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
