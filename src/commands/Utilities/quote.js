const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('quote.noArgs').send();
		}

		let targetMsg;
		if (args[0]) {
			targetMsg = await this.Atlas.util.findMessage(msg.channel, args[0]);
		}

		if (!targetMsg) {
			targetMsg = await this.Atlas.util.messageQuery({
				guild: msg.guild,
				user: msg.author,
				lang: msg.lang,
				responder,
			});
		}

		if (!targetMsg) {
			return responder.error('quote.noMessage').send();
		}

		if (targetMsg.type !== 0) {
			return responder.error('quote.invalidType').send();
		}

		const img = targetMsg.attachments.find(a => a.height);

		if (!targetMsg.content && !img) {
			return responder.error('quote.invalidMsg');
		}

		return responder.embed({
			author: {
				name: targetMsg.author.tag,
				icon_url: targetMsg.author.avatarURL,
				url: `https://discordapp.com/channels/${targetMsg.guild.id}/${targetMsg.channel.id}/${targetMsg.id}`,
			},
			image: {
				url: img && img.proxy_url,
			},
			description: targetMsg.content,
			footer: {
				text: `in #${targetMsg.channel.name}`,
			},
			timestamp: new Date(targetMsg.timestamp),
		}).send();
	}
};

module.exports.info = {
	name: 'quote',
	examples: [
		'https://discordapp.com/channels/340583394192916492/433991387483209739/490622984256618516',
		'490622984256618516',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
	guildOnly: true,
};
