const Command = require('../../structures/Command.js');


module.exports = class FunBan extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const baseBan = this.Atlas.commands.get('ban');

		return baseBan.execute(msg, args, {
			settings,
			fun: true,
		});
	}
};

module.exports.info = {
	name: 'funban',
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
			embedLinks: true,
			banMembers: true,
		},
	},
	guildOnly: true,
};
