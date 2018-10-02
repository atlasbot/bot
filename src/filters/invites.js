const Filter = require('./../structures/Filter');

module.exports = class Invites extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str) {
		// remove spaces, incase people thing putting spaces in the invite will work :^)
		str = str.split(' ').join('');
		const inviteRegex = /discord(?:app\.com\/invite|\.gg)\/([\w-]{2,255})/i;
		const match = inviteRegex.exec(str);
		if (match && match[1]) {
			return !!match[1];
		}
	}
};

module.exports.info = {
	name: 'Invites',
	settingsKey: 'invites',
	description: 'Triggers if a message contains discord invite links.',
};
