const { Player } = require('eris-lavalink');
const PlayerResponder = require('./PlayerResponder');

module.exports = class ExtendedPlayer extends Player {
	constructor(...forward) {
		super(...forward);

		this.Atlas = require('./../../Atlas');
		this.queue = [];
		this.messages = [];
	}

	get responder() {
		if (!this.player) {
			this.player = new PlayerResponder(this, this.lang, {
				settings: this.settings,
			});
		}

		return this.player.channel(this.msg.channel);
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
		this.lang = msg.lang || settings.lang;
		this.msg = msg;

		if (this.playing && !force) {
			const { ttp } = this;

			this.queue.push({
				addedBy: track.addedBy || msg.author,
				...track,
			});

			if (notify) {
				return this.responder
					.text('general.player.trackQueued', track.info.title, this.Atlas.lib.utils.prettyMs(ttp))
					.buttons(false)
					.send();
			}

			return;
		}

		if (!track.addedBy) {
			track.addedBy = msg.author;
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

			if (this.queue.length) {
				third = {
				// todo: hide if it's the first song being added, show something instead
					name: 'general.player.npEmbed.ttp',
					value: this.Atlas.lib.utils.prettyMs(this.ttp),
					inline: true,
				};
			} else {
				third = {
					name: 'general.player.npEmbed.addedBy',
					value: msg.author.username,
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
					text: this.queue.length
						? ['general.player.npEmbed.footerMulti', track.addedby.username, this.queue.length]
						: ['general.player.npEmbed.footerSingle', this.queue.length],
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
