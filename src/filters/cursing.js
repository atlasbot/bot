const swearjar = require('swearjar');

module.exports = class Spam {
	constructor() {
		this.info = {
			name: 'Cursing',
			settingsKey: 'cursing',
			description: 'Triggers if a message contains swearing.',
		};
	}

	execute(str) {
		return swearjar.profane(str);
	}
};
