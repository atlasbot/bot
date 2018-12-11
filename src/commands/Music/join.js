const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action({
		channel,
		member,
		guild,
		lang,
	}, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'join');

		const voiceChannel = guild.channels.get(member.voiceState.channelID);

		if (!voiceChannel) {
			return responder.error('general.player.noVoiceChannel').send();
		}

		const myChannel = channel.guild.channels.get(guild.me.voiceState.channelID);

		if (myChannel && myChannel.voiceMembers.filter(m => !m.bot).length !== 0) {
			return responder.error('alreadyPlaying', myChannel.name).send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);

		if (!myChannel || !player) {
			await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, true);

			return responder.text('joined', voiceChannel.name).send();
		}

		await player.switchChannel(voiceChannel.id, true);

		if (player.paused) {
			return responder.text('switch.paused', voiceChannel.name).send();
		}

		return responder.text('switch.notPaused', voiceChannel.name).send();
	}
};

module.exports.info = {
	name: 'join',
	guildOnly: true,
};
