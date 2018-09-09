const Command = require('../../../structures/Command.js');
// const util = require('util');

module.exports = class Warn extends Command {
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
	name: 'warn',
	description: 'info.warn.base.description',
	guildOnly: true,
	aliases: [
		'warnings',
		'warn',
	],
	requirements: {
		permissions: {
			user: {
				manageMessages: true,
			},
		},
	},
};
