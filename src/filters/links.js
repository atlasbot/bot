const Filter = require('./../structures/Filter');

module.exports = class Links extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, filterConfig) {
		const uri = this.Atlas.lib.utils.isUri(str);
		if (!filterConfig.exclusions.find(pattern => this.Atlas.lib.utils.wildcard.match(pattern, uri))) {
			return uri;
		}
	}
};

module.exports.info = {
	name: 'Links',
	settingsKey: 'links',
	description: 'Triggers if a message contains any valid link.',
};
