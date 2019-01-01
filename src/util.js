const superagent = require('superagent');
const { unflatten } = require('flat');
const assert = require('assert');
const url = require('url');

const lib = require('../lib');
const Parser = require('./tagengine');
const Fuzzy = require('../lib/structures/Fuzzy');
const Cache = require('../lib/structures/Cache');

const profileSchema = user => ({
	id: user.id,
	avatar: user.avatar,
	username: user.username,
	discriminator: user.discriminator,
});

module.exports = class Util {
	constructor(Atlas) {
		this.Atlas = Atlas || require('./../Atlas');

		this.webhookCache = new Cache('webhooks');
		this.musicCache = new Cache('music');

		this._avatar64 = null;
	}

	/**
	 * Gets the bot's avatar in base64 format.
	 * @param {string} [format=png] The format of the avatar.
	 * @returns {Promise<string>} The base64 string with the avatar
	 */
	async avatar64(format = 'png') {
		if (this._avatar64) {
			return this._avatar64;
		}

		const { id, avatar } = this.Atlas.client.user;
		const { body } = await superagent.get(`https://cdn.discordapp.com/avatars/${id}/${avatar}.${format}?size=128`);

		this._avatar64 = `data:image/${format};base64,${body.toString('base64')}`;

		return this._avatar64;
	}

	/**
	 * Formats a locale ID and key to a string, with replacements replaced (if any)
	 * @param {string} identifier The locale identifier. Tl;dr, must have a folder in /locales to be valid.
	 * @param {string|Object} options The key or an object with options, 'commands.' prefix not required for command keys. E.g, 'ping.start' would be converted to 'commands.ping.start'
	 * @param {boolean} x.stringOnly Whether the return value must be a string (if it's not, will return undefined)
	 * @param {string} x.key The key to use, only required of X is not a string itself.
	 * @param  {...string} replacements Replacements to replace things with.
	 * @returns {string|void} The formatted string.
	 */
	format(identifier, options, ...replacements) {
		if (typeof options === 'string') {
			options = {
				key: options,
			};
		}

		const replace = (val, repl) => {
			if (val && repl.length) {
				return val.replace(/\{([0-9]+)\}/ig, (match, p1) => {
					const i = Number(p1);
					if (repl[i] != undefined) { // eslint-disable-line eqeqeq
						return repl[i];
					}

					return match;
				});
			}

			return val;
		};

		if (!this.Atlas.locales.has(identifier)) {
			throw new Error(`${identifier} is not a valid language.`);
		}

		const keys = [options.key, `commands.${options.key}`];

		// supports removing prefixes if they're (probably) trying to get a general/info/other command key
		const parts = options.key.split('.');

		const valid = ['general', 'info', 'commands'];
		const index = parts.findIndex(k => valid.includes(k));

		if (index !== -1) {
			const newParts = parts.splice(index, parts.length);

			keys.push(newParts.join('.'));
		}

		const { data: def } = this.Atlas.locales.get(process.env.DEFAULT_LANG);
		const { data: target } = this.Atlas.locales.get(identifier);

		let val;
		for (const key of keys) {
			val = target[key] || def[key];

			if (val) {
				break;
			}
		}

		if (val) {
			if (options.stringOnly && typeof val !== 'string') {
				return;
			}

			return replace(val, replacements);
		} if (!options.stringOnly) {
			const locale = {
				...def,
				...target,
			};

			// handles getting objects from the locale, which it doesn't like because it's flattened
			const filtered = Object.keys(locale).filter(key => key.startsWith(options.key));

			if (filtered.length) {
				const obj = unflatten(filtered.reduce((o, key) => {
					o[key] = locale[key];

					return o;
				}, {}));

				return replace(this.getNested(obj, options.key, false), replacements);
			}
		}
	}

	/**
	 * Gets a nested value from an object. Keys split at "."
	 * @param {Object} obj The object to grab the value from
	 * @param {string} key The key the value is at, e.g "foo.bar" for { foo: { bar: 'ayy' }}
	 * @param {boolean} [stringOnly=true] Whether returning a string is required
	 * @returns {string|void}
	 */
	getNested(obj, key, stringOnly = true) {
		let val = obj;

		const keys = key.split('.');

		do {
			val = val[keys.shift()];
		} while (val && keys.length);

		if (typeof val === 'string' || stringOnly === false) {
			return val;
		}
	}

	/**
	 * Find a member in the guild
	 * @param {Guild} guild the guild to get members from
	 * @param {string} query the query to use to find the member. Can be a user ID, username, nickname, mention, etc...
	 * @param {Object} opts options
	 * @param {Array} opts.members An optional members list to use
	 * @param {boolean} [opts.memberOnly=false] If false, the return value could be a member or a user object
	 * @param {number} [opts.percent=0.75] the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @returns {Promise<Object|Null>} the member or nothing if nothing was found
	 */
	async findMember(guild, query, {
		percent = 0.75,
		memberOnly = false,
		rest = true,
		members,
	} = {}) {
		if (!query) {
			return;
		}
		const id = this.cleanID(query);

		let guildMembers;
		if (members) {
			guildMembers = new Map();
			members.forEach(m => guildMembers.set(m.id, m));
		} else {
			if (!guild.members) {
				throw new Error('Util#findMember() was given a guild with no "members" array!');
			}
			guildMembers = guild.members; // eslint-disable-line prefer-destructuring
		}

		if (id && lib.utils.isSnowflake(id)) {
			const result = guildMembers.get(id) || this.Atlas.client.users.get(id);
			if (memberOnly || result) {
				if (result) {
					await this.updateUser(result);
				}

				return result;
			}

			if (rest) {
				try {
					try {
						const user = await this.Atlas.client.getRESTUser(id);
						if (user) {
							await this.updateUser(user);

							return user;
						}
					} catch (e) {
						console.warn(e);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}

		const member = (new Fuzzy(members || Array.from(guildMembers.values()), {
			matchPercent: percent,
			keys: [
				'username',
				'nickname',
				'mention',
			],
		})).search(query);

		if (member) {
			await this.updateUser(member);
		}

		return member;
	}

	/**
	 * Finds a role or channel
	 * @param {guild} guild The guild to search for the ID in
	 * @param {string} query the search term. can be a mention, ID, name, etc..
	 * @param {Object} options Options
	 * @param {number} options.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @param {string} options.type The type to search for, defaults to either role or channel. Must be either void, 'role' or 'channel'
	 * @param {boolean} [options.fuzzy=true] Whether to use fuzzy searching.
	 * @returns {Promise<Channel|Role|Void>}
	 */
	async findRoleOrChannel(guild, query, {
		percent,
		type,
		fuzzy = true,
	}) {
		if (!query) {
			return;
		}

		const id = this.cleanID(query);

		const valid = type ? guild[`${type}s`] : new Map([...guild.roles, ...guild.channels]);
		if (id) {
			// it's probably an ID or mention
			if (valid.has(id)) {
				return valid.get(id);
			}
		}

		if (!fuzzy) {
			return;
		}

		return (new Fuzzy(Array.from(valid.values()), {
			percent,
			keys: [
				'mention',
				'name',
			],
		})).search(query);
	}

	/**
	 * Finds a message in a guild/guild channel
	 * @param {channel} channel The channel to search in
	 * @param {string} query the search term. can be an ID, share link, message content
	 * @param {Object} options Options
	 * @param {number} options.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @param {boolean} options.searchContent whether to search the message content or not
	 * @returns {Promise<Message|Void>}
	 */
	async findMessage(channel, query) {
		if (!query) {
			return;
		}
		try {
			const { pathname } = url.parse(query);
			const chunks = pathname.split('/');
			if (chunks.length === 5) {
				const [,,, channelID, messageID] = chunks;
				if (channelID && messageID) {
					const message = await this.Atlas.client.getMessage(channelID, messageID);
					if (message) {
						return message;
					}
				}
			}
		} catch (e) {} // eslint-disable-line no-empty
		const id = this.cleanID(query);

		if (id) {
			try {
				const message = await channel.getMessage(id);

				if (message) {
					return message;
				}
			} catch (e) {} // eslint-disable-line no-empty
		}
	}

	/**
	 * Gets an ID from a string
	 * @param {string} id The ID to clean, can be a mention or anything really.
	 * @returns {string|void} The ID if one was found, otherwise void
	 */
	cleanID(id) {
		// im bad at regex
		let possible = id.match(/[0-9]{15,25}/g);

		if (possible) {
			// if it's a URI, chances are the last ID is the message
			if (lib.utils.isUri(id)) {
				possible = possible.reverse();
			}

			return possible.find(r => lib.utils.isSnowflake(r));
		}
	}

	/**
	 * Queries a user for a message ID.
	 * @param {Object} opts options
	 * @param {Channel} opts.channel The channel to ask the user in
	 * @param {User} opts.user The user to ask
	 * @param {string} opts.emoji The emoji to ask the user to react with
	 * @param {string} opts.message The language string to ask the user with
	 * @param {string} opts.responder The responder to use
	 * @returns {Promise<message|void>}
	 */
	async messageQuery({
		channel,
		user,
		lang = process.env.DEFAULT_LANG,
		emoji = '📦',
		message = 'general.messageQuery',
		responder = new this.Atlas.structs.Responder(channel, lang),
	}) {
		const emojiInfo = this.Atlas.lib.emoji.get(emoji);

		try {
			const queryMsg = await responder.text(message, emoji, emojiInfo.name).send();
			let targetMsg = await this.awaitEmoji(emoji, user);

			queryMsg.delete().catch(() => false);

			if (!targetMsg.content) {
				// if the message was not cached, it will only have basic data
				// so fetch more info about it
				targetMsg = await targetMsg.channel.getMessage(targetMsg.id);
			}

			// in theory they could add the reaction in another guild but yolo\
			return targetMsg;
		} catch (e) {
			await responder.error('general.messageQueryLate', user.mention).send();
		}
	}

	/**
	 * Waits for a user to add an emoji to a message
	 * @param {string} emoji The emoji to add
	 * @param {string} user The ID of the user to wait for
	 * @returns {Promise<Message>} The message, may not be cached.
	 */
	awaitEmoji(emoji, user) {
		return new Promise((resolve, reject) => {
			const collector = new this.Atlas.structs.EmojiCollector();

			collector
				.user(user)
				.emoji([emoji])
				.exec(msg => resolve(msg))
				.listen();

			setTimeout(() => {
				collector.destroy();

				return reject();
			}, 20 * 1000);
		});
	}

	/**
	 *
	 * @param {Guild} guild The guild to get the entry from
	 * @param {string} id The target ID to get an entry for
	 * @param {number} type The audit log entry type - https://discordapp.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events
	 * @param {Object} options options
	 * @param {boolean} options.checkTimestamp Whether or not to check the snowflake created time and see if it's within an acceptable threshold
	 */
	async getGuildAuditEntry(guild, id, type, {
		checkTimestamp = true,
	} = {}) {
		if (!guild.id || !guild.me) {
			throw new Error('Invalid guild.');
		}

		// if we don't have perms to view audit logs, there is no point in trying
		if (!guild.me.permission.has('viewAuditLogs')) {
			return;
		}

		// sometimes something will fake it's own audit log entries to show more accurate data
		const override = this.Atlas.auditOverrides.find(e => e.guild === guild.id
				&& e.type === type
				&& e.targetID === id
				&& (Date.now() - e.date) <= 15000);

		if (override) {
			return override;
		}

		// wait a few seconds to let the audit log catch up, idk why sometimes it takes a bit for logs to show up
		await new Promise(resolve => setTimeout(resolve, 1000));

		const x = await this.Atlas.client.getGuildAuditLogs(guild.id, 25, null, type);
		if (x) {
			const entry = x.entries.find(e => e.targetID === id);

			if (!entry) {
				return;
			}

			if (checkTimestamp) {
				const time = this.Atlas.lib.utils.isSnowflake.getTime(entry.id);

				// if the entry is older then 5 seconds it's probably not the one we're after
				if ((Date.now() - time) > 5000) {
					return;
				}
			}

			return entry;
		}
	}

	/**
	 *update a users interval profile.
	 * @param {Object} author The author or mongodb query
	 * @returns {Promise}
	 */
	async updateUser(author) {
		if (author.user) {
			author = author.user;
		}

		// getProfile will find or create one and cache it.
		const profile = await this.Atlas.DB.getProfile(author);

		const toSave = profileSchema(author);

		try {
			// throws if the objects are not the same
			assert.deepStrictEqual({
				...profile,
				...toSave,
			}, profile);
		} catch (e) {
			// remove any existing cached objects because we're updating it
			await this.Atlas.DB.cache.del(author.id);

			return this.Atlas.DB.User.updateOne({ id: profile.id }, toSave);
		}
	}

	/**
    * Get a webhook for the guild
    * @param {Object|string} c the channel to get the webhook for
    * @param {string} reason The reason to show in the modlog for the webhook
    * @param {boolean} clearHookCache whether or not to use the webhook cache
    * @returns {Promise} the webhook
    * @memberof Guild
    */
	async getWebhook(c, reason, clearHookCache = false) {
		const channelID = c.id || c;

		const existing = await this.webhookCache.get(channelID);
		if (existing) {
			if (clearHookCache) {
				await this.webhookCache.del(channelID);
			} else {
				return existing;
			}
		}

		const channel = this.Atlas.client.getChannel(channelID);

		if (channel && !channel.permissionsOf(this.Atlas.client.user.id).has('manageWebhooks')) {
			throw new Error('No permissions to manage webhooks.');
		}

		let hook = (await this.Atlas.client.getChannelWebhooks(channelID))
			.find(w => w.channel_id === channelID && w.user.id === this.Atlas.client.user.id);

		const avatar = await this.avatar64();

		if (!hook) {
			hook = await this.Atlas.client.createChannelWebhook(channelID, {
				name: this.Atlas.client.user.username,
				avatar,
			}, reason);
		}

		// cache for 10 minutes
		await this.webhookCache.set(channelID, hook, 600);

		return hook;
	}

	/**
	 * Gets related tracks to a lavalink track.
	 * @param {Object} player A player to get a node from
	 * @param {Object} player.node The node to use when searching for tracks.
	 * @param {Object} track A track to use
	 */
	async relatedTrack({ node }, { info }) {
		let { identifier } = info;
		const { uri } = info;

		if (!url.parse(uri).hostname.includes('youtube.com')) {
			// because this relies on youtube, basically just searching for the same song on youtube.
			// every time, 70% of the time, this works.
			identifier = (await superagent.get('https://www.googleapis.com/youtube/v3/search')
				.query({
					part: 'id',
					q: info.title,
					type: 'video',
					key: process.env.YOUTUBE_KEY,
					maxResults: 1,
					chart: 'mostPopular',
				})
				.set('User-Agent', this.Atlas.userAgent)).body.items[0].id.videoId;
		}

		const existing = await this.musicCache.get(identifier);
		if (existing) {
			return existing;
		}

		const { body: { items } } = await superagent.get('https://www.googleapis.com/youtube/v3/search')
			.query({
				part: 'id',
				relatedToVideoId: identifier,
				type: 'video',
				key: process.env.YOUTUBE_KEY,
				maxResults: 1,
				chart: 'mostPopular',
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (items.length) {
			const { videoId } = items[0].id;

			const [track] = (await superagent.get(`http://${node.host}:2333/loadtracks`)
				.query({
					identifier: videoId,
				})
				.set('Authorization', node.password)).body.tracks;

			await this.this.musicCache.set(identifier, track);

			return track;
		}
	}

	async levelup(member, {
		previous: { current: { level: previousLevel } },
		current: { current: { level: currentLevel } },
	}, msg, settings) {
		const { stack, rewards, notify } = settings.plugin('levels').options;

		const shouldHave = rewards
			.filter(r => r.level === currentLevel)
			.map(({ content: roleId }) => member.guild.roles.get(roleId))
			.filter(r => r);

		for (const role of shouldHave) {
			if (!member.roles.includes(role.id) && member.guild.me.highestRole.higherThan(role)) {
				await member.addRole(role.id, 'Level-up');
			}
		}

		if (previousLevel !== currentLevel) {
			if (!stack) {
				const shouldntHave = rewards
					.filter(r => r.level < currentLevel)
					.map(({ content: roleId }) => member.guild.roles.get(roleId))
					.filter(r => r);

				for (const role of shouldntHave) {
					if (member.roles.includes(role.id) && member.guild.me.highestRole.higherThan(role)) {
						await member.removeRole(role.id, 'Level-up');
					}
				}
			}

			if (notify.enabled) {
				const parser = new Parser({
					msg,
					settings,
				}, false);

				const { output } = await parser.parse(notify.content);

				if (notify.stack) {
					try {
						msg.author.createMessage(msg.channel.id, {
							content: output,
						});
					} catch (e) {} // eslint-disable-line no-empty
				} else {
					this.Atlas.client.createMessage(msg.channel.id, {
						content: output,
					});
				}
			}
		}
	}
};
