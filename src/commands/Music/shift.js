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
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'shift');

		const currIndex = Math.floor(Number(args[0])) - 1;
		if (!isFinite(currIndex)) {
			return responder.error('invalidCurrIndex').send();
		}

		const newIndex = Math.floor(Number(args[1])) - 1;
		if (!isFinite(newIndex)) {
			return responder.error('invalidNewIndex').send();
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

		player.queue.splice(newIndex, 0, player.queue.splice(currIndex, 1)[0]);

		const queuePos = newIndex + 1;
		const newPos = player.queue.length > queuePos ? player.queue.length : queuePos;

		return responder.text('moved', track.info.title, currIndex + 1, newPos).send();
	}
};

module.exports.info = {
	name: 'shift',
	examples: [
		'3 1',
		'11 2',
	],
	guildOnly: true,
};
