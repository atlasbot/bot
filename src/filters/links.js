module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	execute(str) {
		return this.Atlas.lib.utils.isUri(str);
	}
};

module.exports.info = {
	name: 'Links',
	settingsKey: 'links',
	description: 'Triggers if a message contains any valid link.',
};
