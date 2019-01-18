const Command = require('../../structures/Command.js');

const Collector = require('../../structures/MessageCollector');

const waiting = new Map();

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
		body,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (waiting.has(msg.author.id)) {
			const number = this.Atlas.lib.utils.parseNumber(args.join(' '));

			if (number) {
				const cb = waiting.get(msg.author.id);

				return cb(number);
			}
		}

		if (!args.length) {
			return responder.error('play.noArgs').send();
		}

		const userVoiceChannel = msg.guild.channels.get(msg.member.voiceState.channelID);
		if (!userVoiceChannel) {
			return responder.error('play.noVoiceChannel').send();
		}

		const botVoiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (botVoiceChannel && botVoiceChannel.members && botVoiceChannel.members.some(m => !m.bot)) {
			return responder.error('play.busy', botVoiceChannel.name).send();
		}

		const perms = userVoiceChannel.permissionsOf(msg.guild.me.id);
		if (!perms.has('voiceConnect') || !perms.has('voiceSpeak')) {
			return responder.error('play.noPerms').send();
		}

		const node = await this.Atlas.client.voiceConnections.findIdealNode(msg.guild.region);
		if (!node) {
			return responder.error('play.noNodes').send();
		}

		const query = args.join(' ').replace(/http(s):\/\/(music|gaming).youtube/g, 'https://www.youtube');
		const isUri = this.Atlas.lib.utils.isUri(query);

		// some commands (see playlist/play.js) provide their own fake body with it's own data
		if (!body) {
			body = await this.Atlas.util.trackSearch(node, query, isUri);
		}

		if (body.premium) {
			const hasPerms = await this.Atlas.lib.utils.isPatron(msg.guild.ownerID) || await this.Atlas.lib.utils.isPatron(msg.author.id);

			if (!hasPerms) {
				return responder.error('play.spotifyLink', msg.displayPrefix).send();
			}
		}

		if (body.loadType === 'NO_MATCHES ' || body.loadType === 'LOAD_FAILED' || !body.tracks.length) {
			return responder.error('play.noResults', query).send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(userVoiceChannel, true);

		player.config(msg, settings);

		// load playlists
		if (body.loadType === 'PLAYLIST_LOADED') {
			const { selectedTrack } = body.playlistInfo;

			// gotta do it before so the "Now playing" message is sent after the playlist loaded message or else it looks fucky
			// also disabling buttons so the "now playing" message has the controls, it just looks nicer + no reason to have double-up
			await player.responder.embed({
				url: (isUri && args[0]) || (this.Atlas.lib.utils.isUri(body.playlistInfo.link) && body.playlistInfo.link),
				thumbnail: {
					url: body.playlistInfo.image,
				},
				title: ['play.playlistEmbed.title', body.playlistInfo.name],
				description: ['play.playlistEmbed.description', msg.author.mention, body.tracks.length],
				timestamp: new Date(),
			}).buttons(false).send();

			for (let i = 0; i < body.tracks.length; i++) {
				const track = body.tracks[i];

				await player.play(track, {
					play: (selectedTrack > -1 && !player.isPlaying) ? selectedTrack === i : true,
					notify: !player.track && i === 0,
					addedBy: msg.author,
				});
			}
		} else {
			let track;

			const musicConf = settings.plugin('music').options;

			if (!isUri && musicConf.show_results) {
				const tmpMsg = await responder.embed({
					color: 3553599,
					title: 'play.searchResults.title',
					description: body.tracks.slice(0, 5).map((t, i) => `${i + 1}. [${this.Atlas.lib.utils.filterTrackName(t.info.title)}](${t.info.uri})`).join('\n'),
					timestamp: new Date(),
					footer: {
						text: ['play.searchResults.footer', msg.displayPrefix],
					},
				}).send();

				const trackNumber = await this.awaitTrackNumber(msg);

				if (isNaN(trackNumber)) {
					return responder.mention(msg.author).text('play.searchQuery.outOfTime').send();
				}

				track = body.tracks[trackNumber];

				if (!track) {
					return responder.mention(msg.author).text('play.searchQuery.invalidTrack', trackNumber).send();
				}

				tmpMsg.delete().catch(() => false);
			} else {
				track = isUri ? body.tracks[0] : this.Atlas.util.findIdealTrack(query, body.tracks);
			}


			// regular, boring old song. play it normally
			await player.play(track, {
				addedBy: msg.author,
			});
		}
	}

	awaitTrackNumber({ author, channel }) {
		return new Promise(async (resolve) => {
			const { parseNumber } = this.Atlas.lib.utils;

			const filter = msg => msg.channel.id === channel.id && msg.author.id === author.id && parseNumber(msg.content, null, 'strict');

			const collector = new Collector(channel, filter);

			const callback = (number) => {
				if (!waiting.has(author.id)) {
					return;
				}

				waiting.delete(author.id);

				collector.end();

				return resolve(number - 1);
			};

			waiting.set(author.id, callback);

			collector.listen(25000);

			const message = await collector.await();

			if (message) {
				return callback(parseNumber(message.content, null, 'strict'));
			}
		});
	}
};

module.exports.info = {
	name: 'play',
	examples: [
		'lil dicky - professional rapper',
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		'https://www.youtube.com/watch?v=W4ocPPhtglU&list=PLoXL8KeHXDAvYjd8SNhPkT7ob3LvbqTEz',
	],
	aliases: [
		'add',
		'p',
		// pre-v8 had a "qplaylist" command because lavalink wouldn't handle it properly, this is legacy support
		'qplaylist',
		'qp',
		'queueplaylist',
		'queuep',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
