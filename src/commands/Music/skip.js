const Command = require('../../structures/Command.js');

module.exports = class Next extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action({
		// only guaranteed arguments
		channel,
		author,
		guild,
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
			return responder.error('next.noPlayer').send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('next.noPlayer').send();
		}

		if (!player.queue.length) {
			return responder.error('next.nothingNext').send();
		}

		const { title } = player.track.info;
		await player.stop();

		return responder.text('next.success', title).send();
	}
};

module.exports.info = {
	name: 'next',
	guildOnly: true,
	aliases: [
		'skip',
	],
};
