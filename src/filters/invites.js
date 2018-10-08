const Filter = require('./../structures/Filter');

// todo: get the guilds invites and make sure it isn't one of the guild's own

module.exports = class Invites extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str) {
		// remove spaces, incase people thing putting spaces in the invite will work :^)
		const match = this.Atlas.constants.inviteRegex.exec(str.split(/ +/g).join(''));

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
