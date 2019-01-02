const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
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
