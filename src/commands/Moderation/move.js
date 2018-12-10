const Command = require('../../structures/Command.js');

module.exports = class Move extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('move.noArgs').send();
		}

		const channel = await settings.findRoleOrChannel(args[0], {
			type: 'channel',
		});

		if (!channel) {
			return responder.error('move.noChannel', args[0]).send();
		}

		let targetMsg;
		if (args[1]) {
			targetMsg = await this.Atlas.util.findMessage(msg.channel, args[1]);
		}
		if (!targetMsg) {
			if (channel.permissionsOf(msg.author.id).has('addReactions')) {
			// ask the user to react to the message to remove

				targetMsg = await this.Atlas.util.messageQuery({
					guild: msg.guild,
					user: msg.author,
					channel: msg.channel,
					responder,
				});
			} else {
				return responder.error('move.noMessageOrPerms').send();
			}
		}

		if (!targetMsg) {
			return responder.error('move.noMessage', args[1]).send();
		}
		if (targetMsg.type !== 0) {
			return responder.error('move.invalidType').send();
		}
		if (targetMsg.channel.id === channel.id) {
			return responder.error('move.sameChannel', channel.mention).send();
		}

		responder.channel(channel)
			.localised(true)
			.embed(targetMsg.embeds ? targetMsg.embeds[0] : null)
			.file(targetMsg.file);

		if (targetMsg.content.trim()) {
			responder.text(`${targetMsg.author.tag}: ${targetMsg.content.substring(0, 1950)}`);
		} else {
			responder.text(targetMsg.author.tag);
		}

		await responder.send();

		targetMsg.delete().catch(() => false);

		return responder.text('move.success', channel.mention).send();
	}
};

module.exports.info = {
	name: 'move',
	examples: [
		'#general',
		'#general https://discordapp.com/channels/340583394192916492/433991387483209739/490622984256618516',
		'#general 490622984256618516',
	],
	supportedFlags: [{
		name: 'no-webhooks',
		description: 'Forces Atlas to not use webhooks.',
	}],
	aliases: ['movemsg', 'movemessage'],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			embedLinks: true,
			manageMessages: true,
		},
	},
	guildOnly: true,
};
