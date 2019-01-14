const superagent = require('superagent');

const Cache = require('atlas-lib/lib/structures/Cache');
const Command = require('../../structures/Command.js');

const Collector = require('../../structures/MessageCollector');

const cache = new Cache('bot-music');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.waiting = new Map();
	}

	async action(msg, args, {
		settings,
		body,
		pseudoBody = !!body,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (this.waiting.has(msg.author.id)) {
			const number = this.Atlas.lib.utils.parseNumber(args.join(' '));

			if (number) {
				const cb = this.waiting.get(msg.author.id);

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
		const url = this.Atlas.lib.utils.isUri(query);

		// some commands (see playlist/play.js) provide their own fake body with it's own data
		if (!body) {
			body = await this.search(node, query, url);
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
				url: pseudoBody ? undefined : args[0],
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

			if (!url && musicConf.show_results) {
				const tmpMsg = await responder.embed({
					color: 3553599,
					title: 'play.searchResults.title',
					description: body.tracks.slice(0, 5).map((t, i) => `${i + 1}. [${t.info.title}](${t.info.uri})`).join('\n'),
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
				track = url ? body.tracks[0] : this.findIdealTrack(query, body.tracks);
			}


			// regular, boring old song. play it normally
			await player.play(track, {
				addedBy: msg.author,
			});
		}
	}

	// australia internet makes searches slow in development, caching makes it faster
	async search(node, query, url) {
		const existing = await cache.get(query);
		if (existing) {
			return existing;
		}

		const { body } = await superagent.get(`http://${node.host}:2333/loadtracks`)
			.query({
				identifier: `${!url ? 'ytsearch:' : ''}${query}`,
			})
			.set('Authorization', node.password);

		await cache.set(query, body);

		return body;
	}

	// "an algorithm" 😉 that finds the best track to play
	findIdealTrack(query, results) {
		// prefer lyric videos because they don't have pauses for scenes in actual videos or sound effects from the video
		const lyrics = this.Atlas.lib.utils.nbsFuzzy(results, ['info.title'], `${query} lyrics`, {
			matchPercent: 0.65,
		});

		if (lyrics) {
			return lyrics;
		}

		// fall back to the first result if no lyrics exist
		return results.shift();
	}

	awaitTrackNumber({ author, channel }) {
		return new Promise(async (resolve) => {
			const cb = (number) => {
				if (!this.waiting.has(author.id)) {
					return;
				}

				this.waiting.delete(author.id);

				return resolve(number - 1);
			};

			this.waiting.set(author.id, cb);

			const collector = new Collector(channel, msg => msg.channel.id === channel.id && msg.author.id === author.id && this.Atlas.lib.utils.parseNumber(msg.content));

			collector.listen(25000);

			const message = await collector.await();

			if (message) {
				return cb(this.Atlas.lib.utils.parseNumber(message.content));
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
