module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	// doNotUse is not guaranteed as this is also called via voiceChannelLeave
	async execute(member, doNotUse, oldChannel) {
		if (oldChannel.voiceMembers.has(member.guild.me.id) && oldChannel.voiceMembers.filter(m => !m.bot).length === 0) {
			const player = await this.Atlas.client.voiceConnections.getPlayer(oldChannel, false);

			if (player && !player.paused) {
				await player.setPause(true);

				if (player.msg) {
					return player.responder.buttons(false).text('general.music.emptyPause').send();
				}
			}
		}
	}
};
