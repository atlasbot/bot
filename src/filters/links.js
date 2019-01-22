const url = require('url');
const Filter = require('./../structures/Filter');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

module.exports = class Links extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig: { exclusions },
	}) {
		const match = URL_REGEX.exec(str);

		if (match) {
			const { hostname } = url.parse(match[0]);

			if (!exclusions.some(e => this.Atlas.lib.utils.wildcard.match(e, hostname))) {
				return hostname;
			}
		}
	}
};

module.exports.info = {
	name: 'Links',
	settingsKey: 'links',
	description: 'Triggers if a message contains any valid link.',
};
