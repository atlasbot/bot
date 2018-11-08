const Command = require('../../../structures/Command.js');

module.exports = class Any extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(...args) {
		// redirects to the base
		const purge = this.Atlas.commands.get('purge');

		return purge.execute(...args);
	}
};

module.exports.info = {
	name: 'any',
	examples: [
		'10',
		'',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			manageMessages: true,
		},
	},
	guildOnly: true,
};
