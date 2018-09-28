module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Excessive Caps',
			settingsKey: 'capitalization',
			description: 'Triggers if a message contains excessive capitalization.',
		};
	}

	execute(str, msg, filterConfig) {
		if (str.length > 3) {
			const uppercase = str.replace(/[^A-Z]/g, '').length;
			const percent = Math.floor((uppercase / str.length) * 100);

			return percent > filterConfig.threshold;
		}
	}
};
