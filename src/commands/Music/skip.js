const Command = require('../../structures/Command.js');

module.exports = class Next extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	// if button is true, it was called via player buttons and not a person typing the command
	async action(msg, {
		settings, // eslint-disable-line no-unused-vars
		button = false, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
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
