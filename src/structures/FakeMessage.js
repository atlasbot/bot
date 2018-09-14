const { Message } = require('eris');

// quite possibly my worst idea yet

module.exports = class FakeMessage {
	constructor({
		channelID,
		content,
		author,
		lang = 'en-US',
		mentions = [],
		type = 0,
		timestamp = new Date(),
	}, Atlas) {
		this.author = author;
		this.content = content;
		this.timestamp = timestamp;
		this.type = type;
		this.channelID = channelID;
		this.mentions = mentions;
		this.lang = lang;

		this.Atlas = Atlas || require('./../../Atlas');
	}

	get() {
		const message = (new Message({
			channel_id: this.channelID,
			type: this.type,
			timestamp: this.timestamp,
			content: this.content,
			author: this.author,
			mentions: this.mentions,
		}, this.Atlas.client));

		message.lang = this.lang;

		return message;
	}
};
