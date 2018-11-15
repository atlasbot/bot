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

		if (!player.queue.length) {
			return responder.error('shuffle.tooFew').send();
		}

		player.queue = this.Atlas.lib.utils.shuffle(player.queue);

		return responder.text('shuffle.success', player.queue.length).send();
	}

	showButton(player) {
		return player.queue.length;
	}
};

module.exports.info = {
	name: 'shuffle',
	guildOnly: true,
};
