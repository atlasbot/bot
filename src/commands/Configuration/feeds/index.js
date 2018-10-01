const Command = require('../../../structures/Command.js');


module.exports = class Feeds extends Command {
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
	name: 'feeds',
	guildOnly: true,
	aliases: [
		'feed',
	],
	requirements: {
		permissions: {
			user: {
				manageGuild: true,
			},
		},
	},
};
