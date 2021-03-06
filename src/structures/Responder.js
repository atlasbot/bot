const Joi = require('joi');
const embedSchema = require('./../schemas/embed');

// the amount of messages atlas will edit instead of sending new ones before waiting for the send message to expire
const MAX_ANTI_FLOOD_EDITS = 4;

/** A responder, sends data to channels. */
class Responder {
	/**
     * Creates a new responder.
     * @param {string|Object} data The channel ID, channel object or message object to pull the channel from.
		 * @param {string} lang The lang to use when sending messages. Overrides "data.lang"
		 * @param {string} keyPrefix A prefix to add before any keys.
     */
	constructor(data, lang, keyPrefix) {
		let channelId;
		if (data) {
			if (data.channel) {
				channelId = data.channel.id || data.channel;
			} else if (data.id) {
				channelId = data.id;
			} else {
				channelId = data;
			}
		}

		this.keyPrefix = keyPrefix;
		this._lang = lang || (data && data.lang);

		this._data = {
			channelId,
			str: null,
			embed: null,
			ttl: 0,
			file: null,
			edit: null,
			noDupe: true,
			localised: false,
			validateEmbed: true,
			dm: {
				user: null,
				fallback: false,
			},
		};

		this.Atlas = require('./../../Atlas');
		this.guild = this.Atlas.client.guilds.find(g => g.channels.has(this._data.channelId));

		// break reference, cheap way but meh
		this._defaults = JSON.parse(JSON.stringify(this._data));

		// events/messageCreate adds some special goodies to guild messages
		if (data && data.options) {
			if (data.options.dm && data.author) {
				this.dm(data.author, true);
			}
		}
	}

	mention(mention) {
		// if a user object is provided
		if (mention.mention) {
			({ mention } = mention);
		}

		this._data.mention = mention;

		if (this._data.str) {
			this._data.str = this._data.str.charAt(0).toLowerCase() + this._data.str.slice(1);
		}

		return this;
	}

	/**
	 * Sets the responder to DM <user> instead of sending to the channel.
	 * @param {User|Object|string} user The user to DM. ID preferable.
	 * @param {boolean} [fallback=true] If true, if the DM fails (closed dm's, etc...) the responder will send the msg to the channel.
   * @returns {Responder} The current responder instance
	 */
	dm(user, fallback = false) {
		this._data.dm = {
			user: user.id || user,
			fallback,
		};

		return this;
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
	localised(bool = true) {
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
     * @param {number} time The time (in seconds) for the message to last before being deleted
     * @returns {Responder} The current responder instance
     */
	ttl(time) {
		this._data.ttl = time * 1000;

		return this;
	}

	/**
	 * Makes the responder edit a message instead of creating a new one
	 * @param {Object} msg The message to edit, must have a .edit() function
     * @returns {Responder} The current responder instance
	 */
	edit(msg) {
		if (!msg) {
			return this;
		}

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
		} else if (!this._lang) {
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
	 * @param {string[]} replacements the strings to replace the placeholders with
	 * @returns {string} the formatted string if successful, otherwise it will throw
	 */
	format(obj, ...replacements) {
		if (typeof obj === 'string') {
			obj = {
				key: obj,
			};
		}

		obj = {
			language: this._lang,
			stringOnly: true,
			...obj,
		};

		const val = this.Atlas.util.format(obj.language, {
			key: this.keyPrefix ? `${this.keyPrefix}.${obj.key}` : obj.key,
			stringOnly: obj.stringOnly,
			replacements,
		}, ...replacements);

		return val;
	}

	/**
	 * Set the responders locale
	 * @param {string} str The name of the locale
     * @returns {Responder} The current responder instance
	 */
	lang(str) {
		this._lang = str;

		return this;
	}

	/**
	 * Set the target channel
	 * @param {Object|string} channel The ID of the channel
     * @returns {Responder} The current responder instance
	 */
	channel(channel) {
		this._data.channelId = channel.id || channel;

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
		 * @param {boolean} validate Whether or not to validate the embed
     * @returns {Responder} The current responder instance
     */
	embed(embed, validate = true) {
		this._data.embed = embed;
		this._data.validateEmbed = validate;

		return this;
	}


	/**
    * Sends the message to the channel. If TTL is set the message will be resolved then deleted after being resolved.
  	* @returns {Promise<Message>} The message being sent
  */
	async send() {
		const data = this._data;
		this._data = JSON.parse(JSON.stringify(this._defaults));

		if (this.guild && !this.guild.me.permission.has('sendMessages')) {
			throw new Error('Atlas does not have permissions to send messages to that channel.');
		}

		let content;
		if (data.str) {
			content = data.str.toString().trim();

			if (data.mention) {
				// append the @mention and lowercase the first char (because grammar 95% of the time)
				content = `${data.mention}, ${content.charAt(0).toLowerCase() + content.slice(1)}`;
			}
		}

		if (data.noDupe && content) {
			const existing = this.Atlas.sent.find(c => c.channel === data.channelId && c.str === content);

			if (existing && existing.channel.messages && existing.channel.messages.has(existing.id)) {
				try {
					if (existing.edited < MAX_ANTI_FLOOD_EDITS) {
						await existing.msg.edit(`${existing.msg.content} (x${existing.edited + 1})`);
					} else if (existing.edited === MAX_ANTI_FLOOD_EDITS) {
						await existing.msg.edit(`${existing.msg.content} (x?)`);
					}

					existing.edited++;
				} catch (e) {
					this.Atlas.Sentry.captureException(e);

					console.warn(e);
				}

				return existing.msg;
			}
		}

		if (data.embed && !data.localised) {
			data.embed = this.localiseObject(data.embed, data.lang);

			if (data.validateEmbed) {
				// will throw if it doesn't work correctly
				this.validateEmbed(data.embed);
			}
		}

		const { embed } = data;

		const payload = {
			content,
			embed,
		};

		if (this.guild) {
			const channel = this.guild.channels.get(data.channelId);

			if (channel && channel.permissionsOf) {
				const perms = channel.permissionsOf(this.Atlas.client.user.id);

				if (!perms.has('sendMessages')) {
					throw new Error('Missing "sendMessages" permission');
				}

				if (embed && !perms.has('embedLinks')) {
					throw new Error('Missing "embedLinks" permission');
				}
			}
		}

		let msg;
		if (data.edit) {
			msg = await data.edit.edit(payload, data.file);
		} else if (data.dm.user) {
			try {
				const channel = await this.Atlas.client.getDMChannel(data.dm.user);

				if (channel) {
					msg = await this.Atlas.client.createMessage(channel.id, payload, data.file);
				} else {
					throw new Error('Could not get DM channel');
				}
			} catch (e) {
				if (data.dm.fallback) {
					msg = await this.Atlas.client.createMessage(data.channelId, payload, data.file);
				} else {
					throw e;
				}
			}
		} else {
			msg = await this.Atlas.client.createMessage(data.channelId, payload, data.file);
		}

		if (data.noDupe) {
			this.Atlas.sent.push({
				channel: data.channelId,
				str: content,
				edited: 1,
				msg,
			});

			setTimeout(() => {
				this.Atlas.sent = this.Atlas.sent.filter(s => s.msg.id !== msg.id);
			}, (data.ttl || 16000) - 1000);
		}

		if (data.ttl && data.ttl > 0) {
			setTimeout(() => {
				msg.delete().catch(console.warn);
			}, data.ttl);
		}

		return msg;
	}

	/**
	 * Replaces an objects locale strings with the actual string.
	 * @param {Object} obj the object to parse
	 * @param {number} iterations the amount of times it's already been looped over
	 * @returns {Object} the object with strings replaced
	 * @private
	 */
	localiseObject(obj, iterations = 0) {
		// here be dragons
		if (!obj) {
			return;
		}

		for (const [key, val] of Object.entries(obj)) {
			let output;

			switch (Array.isArray(val) ? 'array' : typeof val) {
				case 'string':
					// handles 'key' strings (and regular ones)

					if (val.includes(' ')) {
						output = val;
					} else {
						output = this.format({
							key: val,
						});

						if (!output && this.Atlas.lib.utils.isUri(val)) {
							output = val;
						}
					}

					break;
				case 'array':
					if (typeof val[0] === 'string') {
						// handles [key, ...replacements] arrays
						const [localeKey, ...replacements] = val;

						output = this.format(localeKey, ...replacements);
					} else {
						output = val.map(o => this.localiseObject(o));
					}

					break;
				case 'object':
					// handles parsing child objects
					if (iterations >= 10) {
						throw new Error(`Possible error, ${iterations} iterations over ${key}`);
					}

					output = this.localiseObject(val, iterations++);

					break;
				default:
			}

			obj[key] = output || val;
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
