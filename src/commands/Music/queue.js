const lib = require('atlas-lib');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'queue');

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('general.player.none').send();
		}
		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying) {
			return responder.error('general.player.none').send();
		}

		const pageN = this.Atlas.lib.utils.parseNumber(args[0], 1);

		const { queue } = player;
		const np = player.track;

		// fixme: this has random issues when going to certain pages
		responder.paginate({
			user: msg.author.id,
			page: pageN,
		}, (paginator) => {
			const page = lib.utils.paginateArray(queue, paginator.page.current, 8);
			// reset total pages once it's been (re)calculated
			paginator.page.total = page.totalPages;

			const length = [player.track, ...queue]
				.filter(m => m)
				.map(m => (m.info ? m.info.length : 0))
				.reduce((a, b) => a + b, 0) - player.position;

			const formatted = this.Atlas.lib.utils.prettyMs(length);

			const embed = {
				title: 'general.music.nowPlaying.name',
				description: ['general.music.nowPlaying.value', np.info.title, np.info.uri],
				fields: [],
			};

			embed.fields.push({
				name: 'totalDuration.name',
				value: ['totalDuration.value', formatted],
				inline: true,
			}, {
				name: 'inQueue.name',
				value: [
					`inQueue.value.${queue.length === 1
						? 'singular'
						: 'plural'}`,
					queue.length,
				],
				inline: true,
			});

			if (page.data.length) {
				embed.fields.push({
					name: 'upNext.value',
					value: page.data
						.map(m => responder.format('upNext.format', m.index + 1, m.info.title, m.info.uri))
						.join('\n')
						.substring(0, 1024),
				});
			}

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'queue',
	guildOnly: true,
	examples: [
		'1',
	],
	aliases: [
		'upcoming',
		'upnext',
		'q',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
