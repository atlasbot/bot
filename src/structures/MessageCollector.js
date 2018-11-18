let EventEmitter;
try {
	EventEmitter = require('eventemitter3');
} catch (e) {
	({ EventEmitter } = require('events'));
}

module.exports = class extends EventEmitter {
	/**
	 * Creates a new collector
	 * @param {Channel} channel The channel to listen for messages in
	 * @param {function} filter A filter to check each message against before collecting.
	 */
	constructor(channel, filter) {
		super();

		this.channel = channel;
		this.filter = filter;

		this.Atlas = require('../../Atlas');

		this.collect = this.collect.bind(this);
		this.end = this.end.bind(this);
	}

	/**
	 * Await one message, then end the collector.
	 * @returns {Promise<message|void>}
	 */
	await() {
		return new Promise((resolve) => {
			this.on('message', (message) => {
				resolve(message);

				this.end();
			});

			this.on('end', () => {
				resolve();
			});
		});
	}

	/**
	 * Stop the collector
	 * @returns {void}
	 */
	end() {
		this.emit('end');

		return this.Atlas.client.removeListener('messageCreate', this.collect);
	}

	/**
	 * Listen for new messages
	 * @param {number} timeout The time in ms to wait before destroying the collector.
	 * @returns {void}
	 */
	listen(timeout) {
		this.Atlas.client.on('messageCreate', this.collect);

		if (timeout) {
			setTimeout(this.end, timeout);
		}
	}

	/**
	 * Collect a message.
	 * @param {Message} msg *the* message
	 * @private
	 */
	collect(msg) {
		if (msg.type === 0 && msg.channel.id === this.channel.id && (!this.filter || this.filter(msg))) {
			this.emit('message', msg);
		}
	}
};
