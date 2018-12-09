const url = require('url');
const Filter = require('./../structures/Filter');

module.exports = class Links extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig: { exclusions },
	}) {
		const uri = this.Atlas.lib.utils.isUri(str);

		if (uri) {
			const { hostname } = url.parse(uri);

			if (!exclusions.includes(hostname)) {
				return uri;
			}
		}
	}
};

module.exports.info = {
	name: 'Links',
	settingsKey: 'links',
	description: 'Triggers if a message contains any valid link.',
};
