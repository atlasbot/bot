const { Player } = require('eris-lavalink');

const PlayerResponder = require('./PlayerResponder');

module.exports = class extends Player {
	constructor(...forward) {
		super(...forward);

		this.Atlas = require('./../../Atlas');
		this.queue = [];
		this.settings = null;
		this.msg = null;
		this.autoplay = false;
		this.repeat = false;
		this.played = [];
		this.autoplayCache = new Map();
	}

	get responder() {
		if (!this._responder) {
			// todo: settings isn't added fast enough sometimes and it causes issues
			this._responder = new PlayerResponder(this, this.settings ? this.settings.lang : process.env.DEFAULT_LANG, {
				settings: this.settings,
			});
		}

		if (!this.msg) {
			throw new Error('Player not configured - player not ready.');
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
	 * Configures the player with settings and someone to blame
	 * @param {Message} msg a message with guild/channel info
	 * @param {GuildSettings} settings guild settings
	 */
	config(msg, settings) {
		this.msg = msg;
		this.settings = settings;
	}

	onTrackException() {
		if (this.responder) {
			this.responder.text('general.music.trackException').send();
		}

		this.onTrackEnd();
	}

	/**
    * Play a Lavalink track
    * @param {string} track The track to play
  	* @returns {void}
  */
	play(track, {
		force = false,
		notify = true,
		addedBy,
	}) {
		if (!track) {
			throw new Error('No track');
		}

		if (!track.addedBy) {
			// it may be possible for this to be false, probably needs to be double-checked
			track.addedBy = addedBy.tag || addedBy;
		}

		if (this.playing && !force) {
			// queue it, notify the user and do nothing
			this.queue.push(track);

			if (notify) {
				return this.responder
					.text('general.player.trackQueued', track.info.title, this.Atlas.lib.utils.prettyMs(this.ttp - track.info.length))
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

		const { options } = this.settings.plugin('music');

		if (notify && !options.hide_nowplaying) {
			if (options.small_msgs) {
				return this.responder.text('general.music.playingTrack', track.info.title, this.Atlas.lib.utils.prettyMs(track.info.length)).send();
			}

			return this.responder.embed(this.npEmbed(track)).send();
		}
	}

	npEmbed(track) {
		return {
			description: `[${track.info.title}](${track.info.uri})`,
			fields: [{
				name: 'general.player.npEmbed.author',
				value: track.info.author,
				inline: true,
			},
			{
				name: 'general.player.npEmbed.addedBy',
				value: track.addedBy || '???',
				inline: true,
			},
			{
				name: 'general.player.npEmbed.duration',
				value: (track.info.isStream || track.info.length >= 9223372036854776000)
					? '∞'
					: this.Atlas.lib.utils.prettyMs(track.info.length),
				inline: true,
			}],
			timestamp: new Date(),
			footer: {
				text: this.queue.length ? ['general.player.npEmbed.footer', this.queue.length] : null,
			},
		};
	}

	/**
   * Called on track end
   * @param {Object} message The end reason
	 * @returns {void}
   * @private
  */
	async onTrackEnd(message = {}) {
		if (message.reason !== 'REPLACED') {
			if (this.stopped) {
				// don't fuck with anything if the "stop" command was used.
				return;
			}

			this.played.push(this.track || this.lastTrack);

			if (this.repeat) {
				// add it to the end of the queue
				this.queue.push(this.track || this.lastTrack);
			}

			if (this.queue.length) {
				const next = this.queue.shift();

				if (!next) {
					throw new Error('No track but apparently there was one - something fucked up.');
				}

				return this.play(next, {
					force: true,
				});
			}

			if (this.autoplay) {
				try {
					const next = await this.Atlas.util.relatedTrack(this, this.track || this.lastTrack);

					if (next) {
						return this.play(next, {
							force: true,
							addedBy: this.settings.guild.me,
						});
					}

					// autoplay is far from perfect
					await this.responder.buttons(false).text('general.player.autoplay.failed').send();
				} catch (e) {
					console.warn(e);
				}
			}

			if (!this.autoplay) {
				// autoplay can fail sometimes at finding related/suggested songs, and i feel like this is the best way to handle it
				await this.responder.buttons(false).text('general.player.leaving').send();
			}

			await this.Atlas.client.leaveVoiceChannel(this.channelId);
		}
		this.emit('end', message);
	}
};
