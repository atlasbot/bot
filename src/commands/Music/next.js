const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action({
		// only guaranteed arguments
		channel,
		author,
		guild,
		member,
		lang,
	}, args, {
		settings,
		// when true, the command was called via a reaction/player button
		button = false,
	}) {
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang));

		if (button) {
			responder.mention(author.mention);
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

		if (!player.queue.length && !player.autoplay && !player.repeat) {
			return responder.error('next.nothingNext').send();
		}

		const { title } = player.track.info;
		await player.stop();

		return responder.text('next.success', title).send();
	}

	showButton(player) {
		return player.queue.length;
	}
};

module.exports.info = {
	name: 'next',
	guildOnly: true,
	aliases: [
		'skip',
	],
};
