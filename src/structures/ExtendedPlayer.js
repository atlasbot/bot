const { Player } = require('eris-lavalink');
const PlayerResponder = require('./PlayerResponder');

module.exports = class ExtendedPlayer extends Player {
	constructor(id, { hostname, guildId, channelId, shard, node, manager, options }) {
		super(id, { hostname, guildId, channelId, shard, node, manager, options });

		this.Atlas = require('./../../Atlas');
		this.msg = null;
		// The upcoming songs
		this.queue = [];
		this.index = 0;
		this.lang = null;
		this.messages = [];
	}

	get upcoming() {
		return this.queue.slice(this.index);
	}

	get responder() {
		// TODO: use a custom player responder with cleanup built in that extends the default one
		return new PlayerResponder(this, this.lang, {
			settings: this.settings,
		});
	}

	get isPlaying() {
		return !!(this.playing || this.track);
	}

	// gets super accurate positions, accounts for ms differences between last fetched too
	get position() {
		return this.state && this.state.position
			? this.state.position + (new Date() - new Date(this.state.time))
			: 0;
	}

	get timeLeft() {
		if (this.track) {
			return this.track.info.length - this.position;
		}

		return 0;
	}

	/**
	 * Plays a track
	 * @param {Object} track The track to play
	 * @param {Object} playerOpts Options
	 * @param {Message} playerOpts.msg The message to grab a text channel from
	 * @param {Object} options options to pass onto queueEvent
	 * @returns {boolean|Void} True if the song is playing, void if it was only queued.
	 */
	play(
		track,
		{
			msg,
			settings,
			ended = false,
			play = true,
		} = {},
		options = {},
	) {
		if (!track) {
			throw new Error('ExtendedPlayer#play() requires a track');
		}
		if (msg) {
			this.msg = msg;
			this.lang = msg.lang;
		}

		if (!settings && !this.settings) {
			throw new Error('Settings must be provided to the player to work properly.');
		} else if (settings) {
			this.settings = settings;
		}

		this.queue.push(track);

		if ((this.isPlaying && !ended) || !play) {
			return;
		}

		this.lastTrack = this.track;
		this.track = track;
		this.playOptions = options;

		if (this.node.draining) {
			this.state.position = 0;

			return this.manager.switchNode(this);
		}

		this.queueEvent({
			...{
				op: 'play',
				guildId: this.guildId,
				track: track.track || track,
			},
			...options,
		});

		this.playing = !this.paused;
		this.timestamp = Date.now();

		return true;
	}

	/**
     * Called on track end
     * @param {Object} message The end reason
	 * @returns {void}
     * @private
     */
	onTrackEnd(message = {}) {
		if (message.reason !== 'REPLACED') {
			if (this.queue[this.index + 1]) {
				this.index = (this.index + 1);
				this.emit('play', this.queue[this.index]);

				return this.play(this.queue[this.index], {
					ended: true,
				});
			}
			this.playing = false;
			this.lastTrack = this.track;
			this.track = null;

			this.emit('stop');
			// todo: handle leave
		}
		this.emit('end', message);
	}
};
