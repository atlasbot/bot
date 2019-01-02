const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(...args) {
		const sub = this.Atlas.commands.get('warn').subcommands.get('add');

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
