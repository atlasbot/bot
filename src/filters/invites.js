const Filter = require('./../structures/Filter');

module.exports = class Invites extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	async execute(str, { guild }) {
		// remove spaces, incase people thing putting spaces in the invite will work :^)
		const match = this.Atlas.constants.inviteRegex.exec(str.split(/ +/g).join(''));

		if (match && match[1]) {
			const [, code] = match;

			const invites = await guild.getInvites();

			const guildInvite = invites.find(i => i.code === code);

			if (!guildInvite) {
				return !!match[1];
			}
		}
	}
};

module.exports.info = {
	name: 'Invites',
	settingsKey: 'invites',
	description: 'Triggers if a message contains discord invite links.',
};
