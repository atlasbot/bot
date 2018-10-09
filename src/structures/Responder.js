const Joi = require('joi');
const embedSchema = require('./../schemas/embed');

/** A responder, sends data to channels. */

class Responder {
	/**
     * Creates a new responder.
     * @param {string|Object} data The channel ID, channel object or message object to pull the channel from.
	 * @param {string} lang The lang to use when sending messages. Overrides "data.lang"
     */
	constructor(data, lang) {
		let channelID;
		if (data) {
			if (data.channel) {
				channelID = data.channel.id || data.channel;
			} else if (data.id) {
				channelID = data.id;
			} else {
				channelID = data;
			}
		}

		this._data = {
			channelID,
			lang: lang || (data && data.lang),
			str: null,
			embed: null,
			ttl: 0,
			file: null,
			edit: null,
			noDupe: true,
			localised: false,
		};

		this.Atlas = require('./../../Atlas');
		this.guild = this.Atlas.client.guilds.find(g => g.channels.has(this._data.channelID));

		// break reference, cheap way but meh
		this._defaults = JSON.parse(JSON.stringify(this._data));
	}

	file(file) {
		this._data.file = file;

		return this;
	}

	/**
	 * Enables or disables auto localisation and it's whinging
	 * @param {boolean} bool whether or not to localise new textw one when possible
     * @returns {Responder} The current responder instance
	 */
	localised(bool) {
		this._data.localised = bool;

		return this;
	}

	/**
	 * Controls whether or not to edit messages instead of creating a new one when possible
	 * @param {boolean} enabled what to set it to
     * @returns {Responder} The current responder instance
	 */
	noDupe(enabled = true) {
		this._data.noDupe = enabled;

		return this;
	}

	/**
     * Sets the time-to-live time for the message
     * @param {number} [time=15] The time (in MS) for the message to last before being deleted
     * @returns {Responder} The current responder instance
     */
	ttl(time = 15) {
		this._data.ttl = time * 1000;

		return this;
	}

	/**
	 * Makes the responder edit a message instead of creating a new one
	 * @param {Object} msg The message to edit, must have a .edit() function
     * @returns {Responder} The current responder instance
	 */
	edit(msg) {
		if (!msg.edit) {
			throw new Error('Message passed to Responder#edit() had no edit function!');
		} else {
			this._data.edit = msg;

			return this;
		}
	}

	/**
     * Adds data to the message
     * @param {string} key The key for a language value.
     * @returns {Responder} The current responder instance
     */
	text(key, ...replacements) {
		if (!key) {
			throw new Error('Responder#text() was called without including any text!');
		} else if (this._data.localised) {
			if (!this._data.str) {
				this._data.str = key;
			} else {
				this._data.str += key;
			}

			return this;
		} else if (!this._data.lang) {
			throw new Error('No lang provided to Responder#text()');
		}

		const formatted = this.format(key, ...replacements);

		if (!formatted || typeof formatted !== 'string') {
			console.warn(`Unlocalised string "${key}" is being sent as a fallback.`);
			if (!this._data.str) {
				this._data.str = key;
			} else {
				this._data.str += key;
			}

			return this;
		}

		if (!this._data.str) {
			this._data.str = formatted;
		} else {
			this._data.str += formatted;
		}

		return this;
	}

	/**
	 * Returns a formatted string
	 * @param {string|Object} obj options - if this is a string it'll assume it's the key
	 * @param {string} obj.str The key to format
	 * @param {boolean} obj.noThrow If the string is not found, this will determine whether an error is thrown or not
	 * @param {string[]} replacements the strings to replace the placeholders with
	 * @returns {string} the formatted string if successful, otherwise it will throw
	 */
	format(obj, ...replacements) {
		if (typeof obj === 'string') {
			obj = {
				key: obj,
				language: this._data.lang,
				noThrow: true,
				stringOnly: true,
			};
		}

		const val = this.Atlas.util.format(obj.language || this._data.lang, obj.key, ...replacements);

		if (!val && !obj.noThrow) {
			throw new Error(`No language value matching key "${obj.key}"`);
		}

		if (obj.stringOnly && typeof val !== 'string') {
			return;
		}

		return val;
	}

	/**
	 * Set the responders locale
	 * @param {string} str The name of the locale
     * @returns {Responder} The current responder instance
	 */
	lang(str) {
		this._data.lang = str;

		return this;
	}

	/**
	 * Set the target channel
	 * @param {Object|string} channel The ID of the channel
     * @returns {Responder} The current responder instance
	 */
	channel(channel) {
		this._data.channelID = channel.id || channel;

		return this;
	}

	/**
     *
     * @param {string} str The string to add to the message.
     * @param {number} [ttl=15] the TTL
     * @returns {Responder} The current responder instance
     */
	error(str, ...replacements) {
		this.ttl(15);
		this.text(str, ...replacements);

		return this;
	}

	/**
     * Adds an embed to the message.
     * @param {Object} embed The embed to send.
     * @returns {Responder} The current responder instance
     */
	embed(embed) {
		this._data.embed = embed;

		return this;
	}


	/**
     * Sends the message to the channel. If TTL is set the message will be resolved then deleted after being resolved.
     * @returns {Promise<Message>} The message being sent
     */
	async send() {
		const data = this._data;
		this._data = JSON.parse(JSON.stringify(this._defaults));

		this.lang(data.lang);

		if (this.guild) {
			const channel = this.guild.channels.get(this.channelID);
			const { sendMessages } = this.guild.me.permission.json;
			if (!sendMessages || (channel && !channel.permissionOf(this.Atlas.client.user.id).has('sendMessages'))) {
				throw new Error('Atlas does not have permissions to send messages to that channel.');
			}
		}

		if (data.noDupe && data.str) {
			const existing = this.Atlas.sent.find(c => c.channel === data.channelID && c.str === data.str);
			if (existing) {
				try {
					if (existing.edited < 4) {
						await existing.msg.edit(`${existing.msg.content} (x${existing.edited + 1})`);
					} else if (existing.edited === 4) {
						await existing.msg.edit(`${existing.msg.content} (its time to stop)`);
					}

					existing.edited++;
				} catch (e) {
					console.warn(e);
				}

				return existing.msg;
			}
		}

		if (data.embed) {
			data.embed = this._parseObject(data.embed, data.lang);
			// will throw if it doesn't work correctly
			this.validateEmbed(data.embed);
		}

		const msg = await (data.edit ? data.edit.edit({
			content: data.str ? data.str.trim() : undefined,
			embed: data.embed,
		}, data.file) : this.Atlas.client.createMessage(data.channelID, {
			content: data.str ? data.str.trim() : undefined,
			embed: data.embed,
		}, data.file));

		if (data.noDupe) {
			this.Atlas.sent.push({
				channel: data.channelID,
				str: data.str,
				edited: 1,
				msg,
			});

			setTimeout(() => {
				this.Atlas.sent = this.Atlas.sent.filter(s => s.msg.id !== msg.id);
			}, (data._ttl || 16000) - 1000);
		}

		if (data._ttl && data._ttl > 0) {
			setTimeout(() => {
				if (msg) {
					msg.delete().catch(() => false);
				}
			}, data._ttl);
		}

		return msg;
	}

	/**
	 * Replaces an objects locale strings with the actual string.
	 * @param {Object} obj the object to parse
	 * @param {string} lang the language to use
	 * @returns {Object} the object with strings replaced
	 * @private
	 */
	_parseObject(obj, lang) {
		// here be dragons
		if (!obj) {
			return;
		}

		for (const key in obj) {
			if ({}.hasOwnProperty.call(obj, key)) {
				let val = obj[key];
				if (typeof val === 'string') {
					if (!val.includes(' ') && val.includes('.') && !this.Atlas.lib.utils.isUri(val)) {
						val = this.format({
							key: val,
							noThrow: true,
							stringOnly: true,
						}) || val;
					}
				} else if (Array.isArray(val) && typeof val[0] === 'string') {
					const [str, ...replacements] = val;
					if (str && typeof str === 'string') {
						val = this.format(str, ...replacements) || str;
					}
				} else if (val === Object(val)) {
					val = this._parseObject(val, lang);
				}

				obj[key] = val;
			}
		}

		return obj;
	}

	/**
	 * Validates an embed to make sure Discord doesn't say no
	 * @param {Object} embed the embed to validate
	 * @param {boolean} throwErr Whether or not to throw errors or just return them
	 * @returns {string|Void} String with errors or null if there are no errors
	 */
	validateEmbed(embed, throwErr = true) {
		const ret = Joi.validate(embed, embedSchema, {
			abortEarly: false,
		});

		if (throwErr && ret.error) {
			throw new Error(ret.error);
		} else {
			return ret.error;
		}
	}
}
module.exports = Responder;
