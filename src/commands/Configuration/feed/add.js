const Command = require('../../../structures/Command.js');

module.exports = class Feed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.kraken = new this.Atlas.lib.kraken.API(process.env.KRAKEN_TOKEN, {
			host: process.env.KRAKEN_HOST,
			port: process.env.KRAKEN_PORT,
		});
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		// todo: non-patrons only get 10 feeds. checking those things isn't ez ok

		const responder = new this.Atlas.structs.Responder(msg, null, 'feed');

		let [, channelQuery, targetQuery] = args;

		if (!targetQuery) {
			targetQuery = channelQuery;

			channelQuery = msg.channel.id;
		}

		const types = await this.kraken.getTypes();

		const formattedTypes = types.join('`, `');

		if (!args[0]) {
			return responder.error('general.noType', formattedTypes).send();
		}

		const type = args.shift().toLowerCase();

		if (!types.includes(type)) {
			return responder.error('general.invalidType', type, formattedTypes).send();
		}

		const channel = await settings.findRoleOrChannel(channelQuery, {
			type: 'channel',
		});

		if (!channel) {
			return responder.error('add.invalidChannel').send();
		}

		if (!targetQuery) {
			return responder.error('general.noTarget').send();
		}

		const x = await this.Atlas.lib.kraken.validateTarget(type, targetQuery);
		if (!x) {
			return responder.error('general.invalidTarget', targetQuery, type).send();
		}

		const { target, name } = x;

		try {
			await this.kraken.createGuildFeed({
				type,
				target,
				guild: msg.guild.id,
				channel: channel.id,
				allowNSFW: channel.nsfw,
			});

			return responder.text('add.success', name, type, channel.mention).send();
		} catch (e) {
			if (e.response && e.response.body) {
				// 40001 = already exists
				if (e.response.body.code === 40001) {
					const existingChannel = msg.guild.channels.get(e.response.body.data.channel);

					if (!existingChannel) {
						// kraken will handle deleted channels, so something probably fucked up
						throw e;
					}

					return responder.error('add.alreadyExists', name, existingChannel.mention).send();
				}
			}
		}
	}
};

module.exports.info = {
	name: 'add',
	guildOnly: true,
	aliases: [
		'create',
	],
	examples: [
		'reddit #general r/askreddit',
		'reddit #general askreddit',
		'twitch #achannel cyanideplaysgames',
		'twitch #general twitch.tv/cyanideplaysgames',
		'youtube #yetanotherchannel pewdiepie',
	],
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			manageWebhooks: true,
		},
	},
};
