const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const member = this.Atlas.lib.utils.pickOne(Array.from(msg.guild.members.values()));

		return responder.localised().text(member.mention).send();
	}
};

module.exports.info = {
	name: 'someone',
	aliases: ['randomuser'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
	guildOnly: true,
};
