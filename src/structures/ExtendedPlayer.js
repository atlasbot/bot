const { Player } = require('eris-lavalink');
const PlayerResponder = require('./PlayerResponder');

module.exports = class ExtendedPlayer extends Player {
	constructor(...forward) {
		super(...forward);

		this.Atlas = require('./../../Atlas');
		this.queue = [];
	}

	get responder() {
		if (!this._responder) {
			this._responder = new PlayerResponder(this, this.lang, {
				settings: this.settings,
			});
		}

		return this._responder.channel(this.msg.channel);
	}

	/**
	 * Gets a somewhat accurate position player position.
	 */
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

	get isPlaying() {
		return !!(this.playing || this.track);
	}

	get ttp() {
		return this.queue.reduce((a, b) => a + b.info.length, 0) + this.timeLeft;
	}

	/**
    * Play a Lavalink track
    * @param {string} track The track to play
  	* @returns {void}
  */
	play(track, {
		force = false,
		notify = true,
		settings,
		msg,
	}) {
		if ((!settings && !this.settings) || (!msg && !this.msg)) {
			throw new Error('"data.settings" and "data.msg" are required for the player to function.');
		}

		this.settings = settings;
		if (msg) {
			this.lang = settings.lang;
			this.msg = msg;
		}

		if (!track.addedBy) {
			// it may be possible for this to be false, probably needs to be double-checked
			track.addedBy = msg && msg.author;
		}

		if (this.playing && !force) {
			const { ttp } = this;

			this.queue.push(track);

			if (notify) {
				return this.responder
					.text('general.player.trackQueued', track.info.title, this.Atlas.lib.utils.prettyMs(ttp))
					.buttons(false)
					.send();
			}

			return;
		}

		const trackId = track.track;

		this.lastTrack = this.track;
		this.track = track;

		if (this.node.draining) {
			this.state.position = 0;

			return this.manager.switchNode(this);
		}

		const payload = {
			op: 'play',
			guildId: this.guildId,
			track: trackId,
		};

		this.queueEvent(payload);
		this.playing = !this.paused;
		this.timestamp = Date.now();

		if (notify) {
			let third;

			if (this.queue.length || !track.addedBy) {
				third = {
				// todo: hide if it's the first song being added, show something instead
					name: 'general.player.npEmbed.ttp',
					value: this.Atlas.lib.utils.prettyMs(this.ttp),
					inline: true,
				};
			} else {
				third = {
					name: 'general.player.npEmbed.addedBy',
					value: track.addedBy.tag || '???',
					inline: true,
				};
			}

			return this.responder.embed({
				description: `[${track.info.title}](${track.info.uri})`,
				fields: [{
					name: 'general.player.npEmbed.author',
					value: track.info.author,
					inline: true,
				},
				third,
				{
					name: 'general.player.npEmbed.duration',
					value: this.Atlas.lib.utils.prettyMs(track.info.length),
					inline: true,
				}],
				timestamp: new Date(),
				footer: {
					text: (this.queue.length && track.addedBy)
						? ['general.player.npEmbed.footer', track.addedby.username, this.queue.length] : null,
				},
			}).send();
		}
	}

	/**
   * Called on track end
   * @param {Object} message The end reason
	 * @returns {void}
   * @private
  */
	onTrackEnd(message = {}) {
		if (message.reason !== 'REPLACED') {
			if (this.queue.length) {
				const next = this.queue.shift();

				return this.play(next, {
					force: true,
				});
			}

			this.playing = false;
			this.lastTrack = this.track;
			this.track = null;
			// todo: handle leave
		}
		this.emit('end', message);
	}
};