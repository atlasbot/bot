const swearjar = require('swearjar');
const Filter = require('./../structures/Filter');

module.exports = class Cursing extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig,
	}) {
		const scorecard = swearjar.scorecard(str);

		const categories = Object.keys(scorecard);

		if (categories.length) {
			return categories.some(k => filterConfig[k]);
		}
	}
};

module.exports.info = {
	name: 'Cursing',
	settingsKey: 'cursing',
	description: 'Triggers if a message contains swearing.',
};
