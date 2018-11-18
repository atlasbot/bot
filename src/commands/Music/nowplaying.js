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
			return responder.error('general.player.none').send();
		}
		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('general.player.none').send();
		}

		// using the player responder so it adds buttons
		return player.responder.embed(player.npEmbed(player.track)).send();
	}
};

module.exports.info = {
	name: 'nowplaying',
	guildOnly: true,
	aliases: [
		'np',
		'track',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
