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
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'volume');

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

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		// remove any non-numbers (% signs ;)) and parse it as a number
		const raw = args[0].replace(/[^0-9]+/g, '');
		const volume = this.Atlas.lib.utils.parseNumber(raw);

		if (isNaN(volume)) {
			return responder.error('invalid').send();
		}

		if (volume < 1) {
			return responder.error('tooLow').send();
		}

		if (volume > 150) {
			// i never get that problem haha
			// get it? because
			// it's too _high_
			// yeah that was pretty weak
			return responder.error('tooHigh').send();
		}

		await player.setVolume(volume);

		return responder.text('success', volume).send();
	}
};

module.exports.info = {
	name: 'volume',
	examples: [
		'10%',
		'150%',
		'120',
	],
	guildOnly: true,
	patronOnly: true,
};
