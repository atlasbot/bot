module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Invites',
			settingsKey: 'invites',
			description: 'Triggers if a message contains discord invite links.',
		};
	}

	execute(str) {
		const inviteRegex = /discord(?:app\.com\/invite|\.gg)\/([\w-]{2,255})/i;
		const match = inviteRegex.exec(str);
		if (match && match[1]) {
			return !!match[1];
		}
	}
};
