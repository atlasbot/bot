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
	name: 'ticket',
	guildOnly: true,
	examples: [
		'create Hi, I\'m having trouble with my chicken nuggets. pls assist thank u',
	],
};

module.exports.constants = {
	VIEW_PERMS: 68608,
	HIDE_PERMS: 1024,
};
