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
		button,
	}) {
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'repeat');

		if (button) {
			responder.mention(member.mention);
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

		const isRepeating = player.repeat;

		player.repeat = !isRepeating;

		if (player.repeat) {
			return responder.text('enabled').send();
		}

		return responder.text('disabled').send();
	}
};

module.exports.info = {
	name: 'repeat',
	guildOnly: true,
};
