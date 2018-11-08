const Command = require('../../../structures/Command.js');

// todo: action/mod logging for all actions here

module.exports = class User extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(...args) {
		const sub = this.Atlas.commands.get('avatar');

		return sub.execute(...args);
	}
};

module.exports.info = {
	name: 'user',
	guildOnly: true,
	aliases: [
		'member',
	],
};
