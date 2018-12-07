const Filter = require('./../structures/Filter');

module.exports = class Capitalization extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig: { threshold },
	}) {
		if (str.length > 3) {
			const uppercase = str.replace(/[^A-Z]/g, '').length;
			const percent = Math.floor((uppercase / str.length) * 100);

			return percent > threshold;
		}
	}
};

module.exports.info = {
	name: 'Excessive Caps',
	settingsKey: 'capitalization',
	description: 'Triggers if a message contains excessive capitalization.',
};
