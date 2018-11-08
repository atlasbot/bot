const Command = require('../../../structures/Command.js');

// todo: action/mod logging for all actions here
// todo: warning lists have issues with long warn messages

module.exports = class Warn extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(...args) {
		const sub = this.Atlas.commands.get('warn').info.subcommands.get('add');

		return sub.execute(...args);
	}
};

module.exports.info = {
	name: 'warn',
	guildOnly: true,
	aliases: [
		'warn',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
	},
};
