const Fuzzy = require('./structures/Fuzzy');
const lib = require('../lib');

module.exports = class Util {
	constructor(Atlas) {
		this.Atlas = Atlas || require('./../Atlas');
	}

	format(identifier, path, ...replacements) {
		const key = lib.utils.key(path);

		if (!this.Atlas.langs.has(identifier)) {
			throw new Error(`${identifier} is not a valid language.`);
		}

		if (Array.isArray(replacements[0]) && !replacements[1]) {
			// if the first replacement is an array, chances are the array contains actual replacements.
			// some legacy code still uses this way, so replace replacements with the first array
			[replacements] = replacements;
		}

		// merge english and the language it wants incase there are keys that haven't been localised yet
		const lang = { ...this.Atlas.langs.get('en-US'), ...this.Atlas.langs.get(identifier) };
		const val = lib.utils.getNested(lang, key);

		if (!val) {
			return;
		} if (typeof val !== 'string') {
			return val;
		}

		if (replacements[0]) {
			return val.replace(/\{([0-9]+)\}/ig, (match, p1) => {
				const i = Number(p1);
				if (replacements[i]) {
					return replacements[i];
				}

				return '';
			});
		}

		return val;
	}

	/**
	 * Find a member in the guild
	 * @param {Guild} guild the guild to get members from
	 * @param {string} query the query to use to find the member. Can be a user ID, username, nickname, mention, etc...
	 * @param {Object} opts options
	 * @param {Array} opts.members An optional members list to use
	 * @param {boolean} opts.memberOnly If false, the return value could be a member or a user object
	 * @param {number} opts.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @returns {Promise<Object|Null>} the member or nothing if nothing was found
	 */
	async findMember(guild, query, {
		matchPercent = 0.75,
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
				return result;
			}
			if (rest) {
				try {
					try {
						const user = await this.Atlas.client.getRESTUser(id);
						if (user) {
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

		return (new Fuzzy(members || Array.from(guildMembers.values()), {
			matchPercent,
			keys: [
				'username',
				'nickname',
				'mention',
			],
		})).search(query);
	}

	/**
	 * Finds a role or channel
	 * @param {guild} guild The guild to search for the ID in
	 * @param {string} query the search term. can be a mention, ID, name, etc..
	 * @param {Object} options Options
	 * @param {number} options.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @param {string} options.type The type to search for, defaults to either role or channel. Must be either void, 'role' or 'channel'
	 * @returns {Promise<Channel|Role|Void>}
	 */
	async findRoleOrChannel(guild, query, {
		percent,
		type,
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
		const re = /\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/ig;
		if (re.test(query)) {
			re.lastIndex = 0;
			const [,, channelID, messageID] = /\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/ig.exec(query);
			try {
				const message = await this.Atlas.client.getMessage(channelID, messageID);
				if (message) {
					return message;
				}
			} catch (e) {} // eslint-disable-line no-empty
		}
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
		let possible = id.match(/[0-9]{12,}/g);

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
		lang = 'en-US',
		emoji = '📦',
		message = 'general.messageQuery',
		responder = new this.Atlas.structs.Responder(channel, lang),
	}) {
		if (!channel.permissionsOf(user.id).json.addReactions) {
			throw new Error('User does not have permissions to add reactions in that channel.');
		}
		const emojiInfo = this.Atlas.lib.utils.emoji(emoji);
		try {
			const queryMsg = await responder.text(message, emoji, emojiInfo.names[0]).send();
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
		if (!guild.me.permission.json.viewAuditLogs) return;

		// some commands will fake their own audit log entries to show accurate data
		const override = guild.auditOverrides.find(e => e.guild === guild.id
				&& e.type === type
				&& e.targetID === id
				&& (Date.now() - e.date) <= 15000);

		if (override) {
			return override;
		}
		// wait a few seconds to let the audit log catch up
		await new Promise(resolve => setTimeout(resolve, 1000));
		const x = await this.Atlas.client.getGuildAuditLogs(guild.id, 25, null, type);
		if (x) {
			const entry = x.entries.find(e => e.targetID === id);
			if (entry) {
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
	}
};
