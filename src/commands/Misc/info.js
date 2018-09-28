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
			author: {
				icon_url: this.Atlas.client.avatarURL || this.Atlas.client.defaultAvatarURL,
				name: 'commands.info.embed.title',
			},
			description: ['commands.info.embed.description', msg.displayPrefix],
			fields: [
				{
					name: 'commands.info.embed.author.name',
					value: 'commands.info.embed.author.value',
					inline: true,
				},
				{
					name: 'commands.info.embed.invite.name',
					value: 'commands.info.embed.invite.value',
					inline: true,
				},
				{
					name: 'commands.info.embed.support.name',
					value: 'commands.info.embed.support.value',
					inline: true,
				},
				{
					name: 'commands.info.embed.documentation.name',
					value: 'commands.info.embed.documentation.value',
					inline: true,
				},
				{
					name: 'commands.info.embed.status.name',
					value: 'commands.info.embed.status.value',
					inline: true,
				},
				{
					name: 'commands.info.embed.website.name',
					value: 'commands.info.embed.website.value',
					inline: true,
				},
			],
			timestamp: new Date(),
			urlFallback: (text, url) => url,
		}).send();
	}
};

module.exports.info = {
	name: 'info',
	aliases: ['credits'],
};
