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

			try {
				// make sure the invite isn't from the guild
				const invite = await this.Atlas.client.getInvite(code, false);

				if (!invite || invite.guild.id !== guild.id) {
				// yay it's not from the guild, so let's say they're bad
					return true;
				}
			} catch (e) {
				// 10006 = invalid invite
				if (e.code === 10006) {
					return;
				}

				throw e;
			}
		}
	}
};

module.exports.info = {
	name: 'Invites',
	settingsKey: 'invites',
	description: 'Triggers if a message contains discord invite links.',
};
