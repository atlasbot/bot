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

		// TODO: get this working, it should handle shit if it's already playing in a vc
		// const botVoiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		// if (botVoiceChannel && botVoiceChannel.members && botVoiceChannel.members.filter(m => !m.bot).length !== 0) {
		// 	return responder.error('play.busy', botVoiceChannel.name).send();
		// }

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
			.set('Accept', 'application/json');

		if (body.loadType === 'NO_MATCHES ' || body.loadType === 'LOAD_FAILED') {
			responder.error('play.noResults', query).send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(userVoiceChannel, true);
		if (body.loadType === 'PLAYLIST_LOADED') {
			// todo: say it's a playlist
			if (body.selectedTrack > -1) {
				player.index = body.selectedTrack;
			}
			for (const track of body.tracks) {
				await player.play(track);
			}
			player.msg = msg;

			return responder.text('wew');
		}
		const [track] = body.tracks;
		player.play(track, {
			msg,
		});
	}
};

module.exports.info = {
	name: 'play',
	usage: 'info.play.usage',
	description: 'info.play.description',
	examples: [
		'lil dicky - professional rapper',
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	],
	aliases: ['add', 'qplaylist', 'qp', 'queueplaylist', 'queuep'],
	guildOnly: true,
};
