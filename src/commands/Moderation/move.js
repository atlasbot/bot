const Command = require('../../structures/Command.js');

// todo: this needs a lot of work still

module.exports = class Move extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
		parsedArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
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
		} else {
			// ask the user to react to the message to remove

			try {
				await responder.text('move.waiting', channel.mention).send();
				targetMsg = await this.awaitEmoji(msg.guild.id, msg.author.id);

				if (!targetMsg.content) {
					targetMsg = await this.Atlas.util.findMessage(targetMsg.channel, targetMsg.id);
				}

				// in theory they could add the reaction in another guild but yolo
			} catch (e) {
				console.error(e);

				return responder.error('move.notInTime', msg.author.mention).send();
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

		// :package:

		// await targetMsg.delete();

		if (msg.guild.members.get(this.Atlas.client.user.id).permission.json.manageWebhooks && !parsedArgs['no-webhooks']) {
			const [hook] = await channel.getWebhooks();
			if (hook) {
				// forward the message using the webhook
				return this.Atlas.client.executeWebhook(hook.id, hook.token, {
					content: targetMsg.content,
					avatarURL: targetMsg.author.avatarURL || targetMsg.author.defaultAvatarURL,
					username: targetMsg.author.username,
					file: targetMsg.file,
					embeds: targetMsg.embeds,
				});
			}
		}

		return responder.channel(channel)
			.text(`${targetMsg.author.tag}: ${targetMsg.content.substring(0, 1950)}`)
			.embed(targetMsg.embeds ? targetMsg.embeds[0] : null)
			.file(targetMsg.file);
	}

	awaitEmoji(guild, user) {
		return new Promise((resolve, reject) => {
			const collector = new this.Atlas.structs.EmojiCollector();

			console.log(user);

			collector
				.user(user)
				.emoji([
					'📦',
				])
				.exec(msg => resolve(msg))
				.listen();

			setTimeout(() => {
				collector.destroy();

				return reject();
			}, 20 * 1000);
		});
	}
};

module.exports.info = {
	name: 'move',
	usage: 'info.move.usage',
	description: 'info.move.description',
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
	requirements: {
		permissions: {
			user: {
				manageMessages: true,
			},
			bot: {
				manageMessages: true,
			},
		},
	},
	guildOnly: true,
};
