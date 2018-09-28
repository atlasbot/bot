const Command = require('../../../structures/Command.js');

// todo: action/mod logging for all actions here

module.exports = class Warn extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const sub = this.Atlas.commands.get('warn').info.subcommands.get('add');

		return sub.execute(msg, args, {
			settings,
		});
	}
};

module.exports.info = {
	name: 'warn',
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
