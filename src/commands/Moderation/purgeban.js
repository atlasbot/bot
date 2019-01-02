const Command = require('../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const baseBan = this.Atlas.commands.get('ban');

		return baseBan.execute(msg, args, {
			settings,
			purgeDays: 7,
		});
	}
};

module.exports.info = {
	name: 'purgeban',
	// pre-v8 this was called "hardban", but renamed to make it clearer and to stop people asking "the fuck is hardban"
	aliases: ['hardban'],
	examples: [
		'@random breaking the rulez',
		'@random not partying hard enough',
		`${process.env.OWNER} being too cool`,
	],
	permissions: {
		user: {
			banMembers: true,
		},
		bot: {
			banMembers: true,
		},
	},
	guildOnly: true,
};
