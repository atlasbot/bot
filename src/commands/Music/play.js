const superagent = require('superagent');
const Command = require('../../structures/Command.js');
const lib = require('./../../../lib');

const Cache = require('../../../lib/structures/Cache');

const cache = new Cache('bot-music');

module.exports = class Play extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
		body,
		pseudoBody = !!body,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

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

		const node = await this.Atlas.client.voiceConnections.findIdealNode(msg.guild.region);
		if (!node) {
			return responder.error('play.noNodes').send();
		}

		const query = args.join(' ');
		const url = lib.utils.isUri(query);

		// some commands (see playlist/play.js) provide their own fake body with it's own data
		if (!body) {
			body = await this.search(node, query, url);

			if (body.loadType === 'NO_MATCHES ' || body.loadType === 'LOAD_FAILED') {
				responder.error('play.noResults', query).send();
			}
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
					notify: i === 0,
					addedBy: msg.author,
				});
			}
		} else {
			const track = url ? body.tracks[0] : this.findIdealTrack(query, body.tracks);

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
		// pre-v8 had a "qplaylist" command because lavalink wouldn't handle it properly, this is legacy support
		'qplaylist',
		'qp',
		'queueplaylist', 'queuep',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
