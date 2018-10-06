const Command = require('../../../structures/Command.js');

// todo: action/mod logging for all actions here

module.exports = class User extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const sub = this.Atlas.commands.get('avatar');

		return sub.execute(msg, args, {
			settings,
		});
	}
};

module.exports.info = {
	name: 'user',
	guildOnly: true,
	aliases: [
		'member',
	],
};
