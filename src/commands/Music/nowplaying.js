const prettyMs = require('pretty-ms');
const Command = require('../../structures/Command.js');

module.exports = class NowPlaying extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('queue.noPlayer').send();
		}
		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('queue.noPlayer').send();
		}

		const duration = prettyMs(player.track.info.length);
		const position = prettyMs(player.position);

		return responder.embed({
			title: 'general.music.nowPlaying.name',
			description: ['general.music.description', player.track.info.title, player.track.info.uri],
			fields: [{
				name: 'general.music.duration.name',
				value: ['general.music.duration.value', duration],
				inline: true,
			}, {
				name: 'general.music.addedBy.name',
				value: ['general.music.addedBy.value', player.track.addedBy.mention],
				inline: true,
			}, {
				name: 'general.music.position.name',
				value: ['general.music.position.value', position],
				inline: true,
			}],
		}).send();
	}
};

module.exports.info = {
	name: 'nowplaying',
	description: 'info.nowplaying.description',
	guildOnly: true,
	aliases: [
		'np',
		'track',
	],
};
