const swearjar = require('swearjar');

module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	execute(str) {
		return swearjar.profane(str);
	}
};

module.exports.info = {
	name: 'Cursing',
	settingsKey: 'cursing',
	description: 'Triggers if a message contains swearing.',
};
