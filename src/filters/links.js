const isUri = require('./../util/isUri');

module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Links',
			settingsKey: 'links',
		};
	}

	execute(str) {
		return isUri(str);
	}
};
