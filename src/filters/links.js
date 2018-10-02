const Filter = require('./../structures/Filter');

module.exports = class Links extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
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
