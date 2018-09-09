module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Mention Abuse',
			settingsKey: 'mentions',
		};
	}

	execute(str, msg) {
		// TODO: make the "5" customisable
		return msg.mentions.length > 5 || msg.roleMentions.length > 5;
	}
};
