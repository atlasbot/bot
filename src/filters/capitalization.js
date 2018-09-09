module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Excessive Caps',
			settingsKey: 'capitalization',
		};
	}

	execute(str) {
		if (str.length > 3) {
			const uppercase = str.replace(/[^A-Z]/g, '').length;
			const percent = Math.floor((uppercase / str.length) * 100);

			// TODO: make "75" customisable
			return percent > 75;
		}
	}
};
