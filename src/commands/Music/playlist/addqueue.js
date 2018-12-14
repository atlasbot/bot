const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg.channel, (msg.lang || settings.lang), 'playlist.addqueue');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		const playlists = await this.Atlas.DB.Playlist.find({
			author: msg.author.id,
		});

		if (!playlists.length) {
			return responder.error('noPlaylists').send();
		}

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('general.player.none').send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('general.player.none').send();
		}

		if (voiceChannel.id !== msg.member.voiceState.channelID) {
			return responder.error('general.player.sameVoiceChannel').send();
		}

		const query = args.join(' ');
		const playlist = this.Atlas.lib.utils.nbsFuzzy(playlists, [
			'_id',
			'name',
		], query);

		if (!playlist) {
			return responder.error('noneFound', query).send();
		}

		const tracks = [player.track, ...player.queue];

		await this.Atlas.DB.Playlist.updateOne({
			author: msg.author.id,
			_id: playlist._id,
		}, {
			$push: {
				tracks: {
					$each: tracks,
				},
			},
		});

		return responder.text('success', tracks.length, playlist.name).send();
	}
};

module.exports.info = {
	name: 'addqueue',
	aliases: ['add'],
	guildOnly: true,
	patronOnly: true,
};
