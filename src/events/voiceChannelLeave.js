module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(member, oldChannel) {
		const eventHandler = this.Atlas.eventHandlers.get('voiceChannelSwitch');

		eventHandler.execute(member, null, oldChannel);
	}
};
