module.exports = class EmojiCollector {
	constructor() {
		this._msg = null;
		this._add = true;
		this._emojis = [];
		this._userID = null;
		this._filter = null;
		this._remove = false;
		this._validate = null;
		this._Atlas = require('./../../Atlas');
		this._exec = () => {}; // eslint-disable-line no-empty-function

		this.listening = false;
	}

	/**
	 * Sets a filter that will be run on a reaction, if it returns false the event will be ignored.
	 * @param {function} func The filter function, gets the same args as the messageReactionAdd event
	 * @returns {EmojiCollector} the emoji collector
	 */
	filter(func) {
		this._filter = func;

		return this;
	}

	/**
	 * Controls if the collector adds the emojis to the message
	 * @param {boolean} bool If true, the emoji collector will add the reactions to the message.
	 * @returns {EmojiCollector} the emoji collector
	 */
	add(bool = true) {
		this._add = bool;

		return this;
	}

	/**
	 * Sets the message to listen for reactions on.
	 * @param {message} msg The message to pull data from and add reactions to.
	 * @returns {EmojiCollector} the emoji collector
	 */
	msg(msg) {
		if (!msg.addReaction) {
			throw new Error('msg must have "addReaction" func');
		}
		this._msg = msg;

		return this;
	}

	/**
	 * Sets what emojis should be listened for and (if add is set) added to the message.
	 * @param {array<string>|string} data The emojis to add
	 * @returns {EmojiCollector} the emoji collector
	 */
	emoji(data) {
		if (data instanceof Array) {
			if (this._emojis.length !== 0) {
				this._addEmojis(data);
				this._emojis.push(...data);
			} else {
				this._emojis = [...this._emojis, ...data];
			}
		} else {
			this._emojis.push(data);
		}

		return this;
	}

	/**
	 * When a valid reaction is added, this will be called.
	 * @param {function} func The function to call when a valid reaction is added. Gets all data from the messageReactionAdd event and additionally information about the emoji.
	 * @returns {EmojiCollector} the emoji collector
	 */
	exec(func) {
		this._exec = func;

		return this;
	}

	/**
	 * If set, the emoji collector will only accept reactions from this user.
	 * @param {Object|string|user} data The user to listen to reactions from.
	 * @returns {EmojiCollector} the emoji collector
	 */
	user(data) {
		this._userID = data ? data.id || data : null;

		return this;
	}

	/**
	 * Starts the emoji collector
	 * @returns {EmojiCollector} the emoji collector
	 */
	listen() {
		// todo: make this support generally listening for emojis
		if (!this._exec) {
			throw new Error('Exec func is required');
		}
		if (this._msg) {
			this._Atlas.collectors.emojis.add(this._msg.id, this);
		} else if (this._userID) {
			this._Atlas.collectors.emojis.add(this._userID, this);
		} else {
			throw new Error('Either a user or message is required to listen to emojis.');
		}

		this.listening = true;
		if (this._emojis.length !== 0 && this._add) {
			return this._addEmojis();
		}

		return this;
	}

	/**
	 * Whether to remove reactions once they're added
	 * @param {boolean} bool If true, any reaction added to the target message will be removed from it.
	 * @returns {EmojiCollector} the emoji collector
	 */
	remove(bool = false) {
		this._remove = bool;

		return this;
	}

	/**
	 * Validates emojis from reactions to see if they are valid or not.
	 * @param {function} func The function, gets the message and the emoji. if it returns false, the emoji is ignored.
	 * @returns {EmojiCollector} the emoji collector
	 */
	validate(func) {
		this._validate = func;

		return this;
	}

	/**
	 * When a reaction is added, this is fired.
	 * @param {message} msg The message the reaction was added to
	 * @param {Object} emoji The emoji that was added
	 * @param {string} userID The ID of the user that added the emoji
	 * @private
	 */
	async fire(msg, emoji, userID) {
		if (this._remove && userID !== this._Atlas.client.user.id) {
			msg.removeReaction(emoji.name, userID)
				.catch(console.error);
		}
		if (this._msg && msg.id !== this._msg.id) {
			return;
		}
		if (this._userID && userID !== this._userID) {
			return;
		}
		if (this._filter && await !this._filter(msg, emoji, userID)) {
			return;
		}
		if (this._emojis.length !== 0) {
			if (this._validate) {
				if (!this._validate(msg, emoji)) {
					return;
				}
			} else if (!this._emojis.includes(emoji.name) && !this._emojis.includes(emoji.id)) {
				return;
			}
		}

		return this._exec(msg, emoji, userID, this._Atlas.lib.utils.emoji(emoji.name));
	}

	/**
	 * Adds emojis
	 * @param {array} emojis The emojis to add, if null it will use this._emojis
	 * @private
	 */
	async _addEmojis(emojis) {
		if (!emojis) {
			emojis = this._emojis;
		}
		if (!this._msg) {
			return emojis;
		}

		for (const emoji of emojis) {
			try {
				await this._msg.addReaction(emoji);
			} catch (e) {
				console.error(e);

				break;
			}
		}

		return emojis;
	}

	/**
	 * Destroys the collector. Basically it will stop listening for reactions.
	 * @returns {void}
	 */
	destroy() {
		if (this._msg) {
			this._Atlas.collectors.emojis.delete(this._msg.id, this);
		}
		if (this._userID) {
			this._Atlas.collectors.emojis.delete(this._userID, this);
		}
	}
};
