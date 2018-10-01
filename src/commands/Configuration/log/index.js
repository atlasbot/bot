const Command = require('../../../structures/Command.js');


module.exports = class Log extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.embed(this.helpEmbed(msg)).send();
	}
};

module.exports.info = {
	name: 'log',
	aliases: ['logs'],
	guildOnly: true,
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			manageWebhooks: true,
		},
	},
};
