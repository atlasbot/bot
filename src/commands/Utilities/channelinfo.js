const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
		channel,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'channelinfo');

		// "resolveid" provides it's own channel
		if (!channel) {
			({ channel } = msg);

			if (args.length) {
				const query = args.join(' ');

				channel = await settings.findRoleOrChannel(query, {
					type: 'channel',
				});

				if (!channel) {
					return responder.error('notFound', query).send();
				}
			}
		}

		// we now 110% have a channel
		const type = this.Atlas.lib.utils.getChannelType(channel.type);
		const parent = msg.guild.channels.get(channel.parentID);
		const name = type === 'text' ? channel.mention : channel.name;
		// TODO: make other *info commands use the time formatter, apparently they don't
		const createdAt = this.Atlas.lib.utils.timeFormat(new Date(channel.createdAt), true);

		const embed = {
			fields: [{
				name: 'name',
				value: name,
			}, {
				name: 'id',
				value: `\`${channel.id}\``,
			}, {
				name: 'type',
				value: type,
			}, {
				name: 'createdAt',
				value: createdAt,
			}, {
				name: 'position',
				value: channel.position,
			}],
		};

		if (parent) {
			embed.fields.push({
				name: 'parent',
				value: parent.name,
			});
		}

		switch (type) {
			case 'text':
				// guild text
				embed.fields.push({
					name: 'nsfw',
					value: channel.nsfw,
				}, {
					name: 'mention',
					value: `\`${channel.mention}\``,
				});

				break;
			case 'voice':
				embed.fields.push({
					name: 'bitrate',
					value: `${channel.bitrate / 1000}kbps`,
				});

				if (channel.userLimit !== 0) {
					embed.fields.push({
						name: 'userLimit',
						value: channel.userLimit,
					});
				}

				if (channel.voiceMembers.size !== 0) {
					embed.fields.push({
						name: 'voiceMembers',
						value: channel.voiceMembers.size,
					});
				}

				break;
			default:
		}

		embed.fields.forEach((f) => {
			f.inline = true;
		});

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'channelinfo',
	aliases: ['cinfo', 'ci'],
	examples: [
		'#general',
		'general',
		'my-epic-vc',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
	guildOnly: true,
};
