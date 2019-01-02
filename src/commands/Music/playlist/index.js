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
	name: 'playlist',
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
