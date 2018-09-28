module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Links',
			settingsKey: 'links',
			description: 'Triggers if a message contains any valid link.',
		};
	}

	execute(str) {
		return this.Atlas.lib.utils.isUri(str);
	}
};
