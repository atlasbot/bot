const { PlayerManager } = require('eris-lavalink');

module.exports = class extends PlayerManager {
	constructor(client, nodes, options) {
		super(client, nodes, options);
		this.Atlas = require('../../Atlas');
	}

	getPlayer(channel, join = false) {
		if (!channel) {
			return;
		}

		if (!channel.guild || channel.type !== 2) {
			throw new Error('Not a valid channel');
		}

		const player = this.Atlas.client.voiceConnections.get(channel.guild.id);
		if (player) {
			return player;
		}
		if (join) {
			const options = {};
			if (channel.guild.region) {
				options.region = channel.guild.region;
			}

			return this.Atlas.client.joinVoiceChannel(channel.id, options);
		}
	}
};
