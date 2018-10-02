const swearjar = require('swearjar');
const Filter = require('./../structures/Filter');

module.exports = class Cursing extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str) {
		return swearjar.profane(str);
	}
};

module.exports.info = {
	name: 'Cursing',
	settingsKey: 'cursing',
	description: 'Triggers if a message contains swearing.',
};
