const swearjar = require('swearjar');

module.exports = class Spam {
	constructor() {
		this.info = {
			name: 'Cursing',
			settingsKey: 'cursing',
		};
	}

	execute(str) {
		return swearjar.profane(str);
	}
};
