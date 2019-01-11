const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg.channel, (msg.lang || settings.lang), 'playlist.create');

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

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		if (!player.queue.length || !player.track) {
			return responder.error('nothingPlaying').send();
		}

		const name = args.join(' ');

		if (name.length > 24) {
			return responder.error('tooLong').send();
		}

		const tracks = [
			player.track,
			...player.queue,
		];

		if (tracks.some(t => t.info.isStream)) {
			return responder.error('livestreamFound').send();
		}

		await this.Atlas.DB.get('playlists').insert({
			author: msg.author.id,
			name,
			tracks,
		});

		return responder.text('success', msg.prefix, name).send();
	}
};

module.exports.info = {
	name: 'create',
	guildOnly: true,
	patronOnly: true,
};
