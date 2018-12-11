const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action({
		// only guaranteed arguments
		channel,
		member,
		guild,
		lang,
	}, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'remove');

		const currIndex = Math.floor(Number(args[0])) - 1;
		if (!isFinite(currIndex)) {
			return responder.error('invalidCurrIndex').send();
		}

		const voiceChannel = guild.channels.get(guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('general.player.none').send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('general.player.none').send();
		}

		if (voiceChannel.id !== member.voiceState.channelID) {
			return responder.error('general.player.sameVoiceChannel').send();
		}

		const track = player.queue[currIndex];
		if (!track) {
			return responder.error('noTrack', currIndex).send();
		}

		player.queue.splice(currIndex, 1);

		return responder.text('removed', track.info.title).send();
	}
};

module.exports.info = {
	name: 'remove',
	examples: [
		'1',
		'3',
	],
	guildOnly: true,
};
