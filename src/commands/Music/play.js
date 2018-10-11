const superagent = require('superagent');
const Command = require('../../structures/Command.js');
const lib = require('./../../../lib');

module.exports = class Play extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('play.noArgs');
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

		const { body } = await superagent.get(`http://${node.host}:2333/loadtracks`)
			.query({
				identifier: `${!url ? 'ytsearch:' : ''}${query}`,
			})
			.set('Authorization', node.password)
			.set('Accept', 'application/json')
			// not really needed but meh
			.set('User-Agent', this.Atlas.userAgent);

		if (body.loadType === 'NO_MATCHES ' || body.loadType === 'LOAD_FAILED') {
			responder.error('play.noResults', query).send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(userVoiceChannel, true);
		if (body.loadType === 'PLAYLIST_LOADED') {
			// todo: say it's a playlist
			const selected = body.playlistInfo.selectedTrack;
			// if the player is playing we don't wanna mess with the index directly
			if (selected > -1 && !player.isPlaying) {
				player.index += selected;
			}
			for (let i = 0; i < body.tracks.length; i++) {
				const track = body.tracks[i];
				// add the playlist URL to the track incase it's needed in the future
				[track.info.playlist] = args;

				await player.play(track, {
					play: selected > -1 ? selected === i : true,
					notify: false,
					settings,
					msg,
				});
			}

			return player.responder.embed({
				url: args[0],
				title: ['play.playlistEmbed.title', body.playlistInfo.name],
				description: ['play.playlistEmbed.description', msg.author.mention, body.tracks.length],
				timestamp: new Date(),
			}).send();
		}

		// it's not a playlist so load it normally

		const [track] = body.tracks;

		await player.play(track, {
			msg,
			settings,
		});
	}
};

module.exports.info = {
	name: 'play',
	examples: [
		'lil dicky - professional rapper',
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	],
	aliases: ['add', 'qplaylist', 'qp', 'queueplaylist', 'queuep'],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
