const Command = require('../../../structures/Command.js');

module.exports = class Server extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!msg.guild.icon) {
			return responder.error('avatar.server.noIcon').send();
		}

		const { icon } = msg.guild;
		const url = size => `https://cdn.discordapp.com/icons/${msg.guild.id}/${icon}?size=${size}`;

		return responder.embed({
			title: 'avatar.base.title',
			url: url(1024),
			image: {
				url: url(128),
			},
		}).send();
	}
};

module.exports.info = {
	name: 'server',
	aliases: [
		'guild',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
