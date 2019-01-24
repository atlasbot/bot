const Command = require('../../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.embed(this.helpEmbed(msg)).send();
	}
};

module.exports.info = {
	name: 'filters',
	guildOnly: true,
	aliases: [
		'filter',
	],
	examples: [
		'list',
		'action capitalization disabled',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			embedLinks: true,
			manageMessages: true,
		},
	},
};
