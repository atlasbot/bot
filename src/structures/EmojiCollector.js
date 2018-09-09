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

	filter(func) {
		this._filter = func;

		return this;
	}

	add(bool = true) {
		this._add = bool;

		return this;
	}

	msg(msg) {
		if (!msg.addReaction) {
			throw new Error('msg must have "addReaction" func');
		}
		this._msg = msg;

		return this;
	}

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

	exec(func) {
		this._exec = func;

		return this;
	}

	user(data) {
		this._userID = data ? data.id || data : null;

		return this;
	}

	listen() {
		if (!this._msg) {
			throw new Error('Message ID is required');
		} else if (!this._exec) {
			throw new Error('Exec func is required');
		}
		this._Atlas.collectors.emojis[this._msg.id] = this;
		this.listening = true;

		if (this._emojis.length !== 0 && this._add) {
			return this._addEmojis();
		}

		return this;
	}

	remove(bool = false) {
		this._remove = bool;

		return this;
	}

	validate(func) {
		this._validate = func;

		return this;
	}

	fire(msg, emoji, userID) {
		if (this._remove && userID !== this._Atlas.client.user.id) {
			msg.removeReaction(emoji.name, userID)
				.catch(console.error);
		}
		if (msg.id !== this._msg.id) {
			return;
		}
		if (this._userID && userID !== this._userID) {
			return;
		}
		if (this._filter && !this._filter(msg, emoji, userID)) {
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

		return this._exec(msg, emoji, userID);
	}

	async _addEmojis(emojis) {
		if (!emojis) {
			emojis = [...this._emojis];
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

	destroy() {
		return delete this._Atlas.collectors.emojis[this._msg.id];
	}
};
