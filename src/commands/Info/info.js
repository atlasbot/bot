const Command = require('../../structures/Command.js');

module.exports = class Info extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.embed({
			title: 'commands.info.title',
			thumbnail: {
				url: this.Atlas.client.user.avatarURL,
			},
			description: ['commands.info.description', this.Atlas.commands.labels.size.toLocaleString()],
			fields: [
				{
					name: 'commands.info.support.name',
					value: 'commands.info.support.value',
					inline: true,
				},
				{
					name: 'commands.info.website.name',
					value: 'commands.info.website.value',
					inline: true,
				},
			],
			timestamp: new Date(),
		}).send();
	}
};

module.exports.info = {
	name: 'info',
	aliases: ['credits'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
