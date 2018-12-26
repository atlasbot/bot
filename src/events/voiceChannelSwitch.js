module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	// doNotUse is not guaranteed as this is also called via voiceChannelLeave
	async execute(member, doNotUse, oldChannel) {
		if (oldChannel.voiceMembers.has(member.guild.me.id) && oldChannel.voiceMembers.filter(m => !m.bot).length === 0) {
			const player = await this.Atlas.client.voiceConnections.getPlayer(oldChannel, false);

			if (player) {
				await player.setPause(true);

				return player.responder.buttons(false).text('general.music.emptyPause').send();
			}
		}
	}
};
