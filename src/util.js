const superagent = require('superagent');
const { unflatten } = require('flat');
const assert = require('assert');
const url = require('url');

const lib = require('atlas-lib');
const Fuzzy = require('atlas-lib/lib/structures/Fuzzy');
const Cache = require('atlas-lib/lib/structures/Cache');

const Spotify = require('./structures/Spotify');
const Parser = require('./tagengine');

const spotifyClient = new Spotify();

/**
 * General utilities atlas uses
 */
module.exports = class Util {
	/**
	 * Util constructor
	 * @param {Atlas} [Atlas=require('./../Atlas')] The Atlas instance to use
	 */
	constructor(Atlas) {
		this.Atlas = Atlas || require('./../Atlas');

		this.musicCache = new Cache('music');
	}

	/**
	 * Formats a user into a savable profile
	 * @param {Object|User} user The user/user's info to format
	 * @returns {Object} The profile that should be up to date
	 */
	profileSchema(user) {
		return {
			id: user.id,
			avatar: user.avatar,
			username: user.username,
			discriminator: user.discriminator,
		};
	}

	/**
	 * Formats a Spotify track from their API into a pseudo lavalink track that the player can play
	 * @param {Object} track The track with all it's fancy info
	 * @returns {Object} The lavalink pseudo-track
	 */
	formatSpotifyTrack(track) {
		return {
			// player will catch that's a spotify link and resolve other info when it plays it
			info: {
				identifier: track.id,
				author: track.artists.map(a => a.name).join(', '),
				title: track.name,
				uri: track.external_urls.spotify,
				targetDuration: track.duration_ms,
				// the player will replace these values but some things break without it
				length: track.duration_ms,
			},
		};
	}

	/**
	 * Search via Lavalink for a track
	 *
	 * @param {Object} node The lavalink node to search on, should be the same as the node that will be used to prevent youtube restrictions from thinking it's free real-estate
	 * @param {string} query The search term the user is wanting
	 * @param {boolean} [isUri=this.Atlas.lib.utils.isUri(query)] Whether the query is a URI or not.
	 * @returns {Object} a Lavalink body containing tracks, etc..
	 */
	async trackSearch(node, query, isUri = this.Atlas.lib.utils.isUri(query)) {
		const existing = await this.musicCache.get(query);
		if (existing) {
			return existing;
		}

		// parses a spotify uri/url into a { type: 'playlist/track', id: 'spotify id' }
		const spotify = this.Atlas.lib.utils.spotifyParser(query);

		if (spotify) {
			/*
				Spotify links are special because lavalink doesn't natively support them
			*/
			const body = {
				// "premium" means only patrons/premium servers can use it
				// spotify links aren't so easy, so i think that's fair
				premium: true,
				loadType: spotify.type === 'playlist' ? 'PLAYLIST_LOADED' : 'TRACK_LOADED',
				playlistInfo: {},
				tracks: [],
			};

			if (spotify.type === 'track') {
				// get track info from spotify
				const track = await spotifyClient.getTrack(spotify.id);

				// add the track to the "lavalink result"
				body.tracks.push(this.formatSpotifyTrack(track));
			}

			if (spotify.type === 'playlist') {
				// get playlist info from spotify
				const playlist = await spotifyClient.getPlaylist(spotify.id);

				// add fancy details about the playlist
				body.playlistInfo.image = playlist.images[0].url;
				body.playlistInfo.name = playlist.name;
				body.playlistInfo.link = playlist.external_urls.spotify;

				// format each track and set the "lavalink result" body to those tracks
				body.tracks = playlist.tracks.items.map(({ track }) => this.formatSpotifyTrack(track));
			}

			// cache it so we only have to fetch it once
			await this.musicCache.set(query, body);

			return body;
		}

		/*
			it's not a spotify link so we don't have to flip our shit
		*/

		// regular lavalink search
		const { body } = await superagent.get(`http://${node.host}:2333/loadtracks`)
			.query({
				identifier: `${!isUri ? 'ytsearch:' : ''}${query}`,
			})
			.set('Authorization', node.password);

		// cache it so we don't have to search twice (australian 2s development search delay ftw)
		await this.musicCache.set(query, body);

		return body;
	}

	/**
	 * "an algorithm" 😉 that finds the best track to play
	 * @param {string} query The search term the user used
	 * @param {array<Object>} results An array of tracks to search
	 * @returns {Object} The most ideal track to play
	 */
	findIdealTrack(query, results) {
		// prefer lyric videos because they don't have pauses for scenes in actual videos or sound effects from the video
		const lyrics = this.Atlas.lib.utils.nbsFuzzy(results, ['info.title'], `${query} lyrics`, {
			matchPercent: 0.65,
		});

		// yeet we found a lyrics video
		if (lyrics) {
			return lyrics;
		}

		// fall back to the first result if no lyrics exist
		return results.shift();
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
				// replaces {0} in the string with replacements[0]
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

		// this does some weird shit but basically it gets the index of a valid key ("general", "commands", "info")
		// prefering ones at the end of the array because there are a few cases where there are multiple "general" parts
		for (const v of valid) {
			const index = parts.lastIndexOf(v);

			if (index !== -1) {
				const newParts = parts.splice(index, parts.length);

				keys.push(newParts.join('.'));
			}
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

				return replace(this.Atlas.lib.utils.getNested(obj, options.key, false), replacements);
			}
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
	async findUser(guild, query, {
		percent = 0.75,
		memberOnly = false,
		rest = true,
		members,
	} = {}) {
		if (!query) {
			return;
		}

		// strips things like <@ID> (for mentions) or other useless text around possible Id's
		const id = this.cleanID(query);

		let guildMembers;
		if (members) {
			guildMembers = new Map();

			members.forEach(m => guildMembers.set(m.id, m));
		} else {
			if (!guild.members) {
				throw new Error('Util#findUser() was given a guild with no "members" array!');
			}

			guildMembers = guild.members; // eslint-disable-line prefer-destructuring
		}

		if (id) {
			if (memberOnly) {
				try {
					const member = guildMembers.get(id) || await this.Atlas.client.getRESTGuildMember(guild.id, id);

					if (member) {
						await this.updateUser(member);
					}

					return member;
				} catch (e) {
					return;
				}
			}

			const result = this.Atlas.client.users.get(id);

			if (result) {
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

		if (channel.guild) {
			const hasChannel = channel.guild.channels.find(c => c.type === 0 && c.messages.has(id));
			if (hasChannel) {
				return hasChannel.messages.get(id);
			}
		}

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
	 * Gets a more or less accurate audit entry for an event target id (on channel update this would be the channel id, etc...)
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

		if (!guild.me.permission.has('viewAuditLogs')) {
			return;
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

		const x = await guild.getAuditLogs(25, null, type);
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
	 * update a users interval profile.
	 *
	 * @param {Object} author The author or mongodb query
	 * @returns {Promise}
	 */
	async updateUser(author) {
		if (author.user) {
			author = author.user;
		}

		// user will find or create one and cache it.
		const profile = await this.Atlas.DB.user(author);

		const toSave = this.profileSchema(author);

		try {
			// throws if the objects are not the same
			assert.deepStrictEqual({
				...profile,
				...toSave,
			}, profile);
		} catch (e) {
			// remove any existing cached objects because we're updating it
			return this.Atlas.DB.get('users').update({ id: profile.id }, {
				$set: toSave,
			});
		}
	}

	/**
	 * Gets related tracks to a lavalink track.
	 *
	 * @param {Object} player A player to get a node from
	 * @param {Object} player.node The node to use when searching for tracks.
	 * @param {Object} track A track to use
	 */
	async relatedTrack(player, { info }) {
		const parsedTitle = this.Atlas.lib.utils.filterTrackName(info.title);

		try {
			const { body: { results: { trackmatches: { track: [track] } } } } = await superagent.get('http://ws.audioscrobbler.com/2.0/?method=track.search')
				.query({
					track: parsedTitle,
					api_key: process.env.LASTFM_KEY,
					format: 'json',
				});

			if (!track) {
				return;
			}

			const closest = async () => {
				// if last.fm doesn't give us something similar we'll search for other songs by the artist as a fallback
				const { body: { tracks } } = await superagent.get(`http://${player.node.host}:2333/loadtracks`)
					.query({
						identifier: `ytsearch:${track.artist}`,
					})
					.set('Authorization', player.node.password);

				if (tracks.length) {
					return tracks.find(t => !t.info.title.toLowerCase().includes(track.name.toLowerCase())) || tracks[0];
				}
			};

			const { body: { similartracks: { track: similarTracks } } } = await superagent.get('http://ws.audioscrobbler.com/2.0/?method=track.getsimilar')
				.query({
					artist: track.artist,
					track: track.name,
					api_key: process.env.LASTFM_KEY,
					format: 'json',
				});

			let similar;
			for (const candidate of similarTracks) {
				let played;

				if (player.autoplayCache.has(candidate.name)) {
					played = true;
				}

				if (!played) {
					// this may get slow for large queues
					const playedTitles = player.played.map(({ info: { title: trackName } }) => ({
						title: this.Atlas.lib.utils.filterTrackName(trackName),
					}));

					for (const title of [candidate.name, `${candidate.artist.name} - ${candidate.name}`]) {
						played = this.Atlas.lib.utils.nbsFuzzy(playedTitles, ['title'], title, {
							matchPercent: 0.65,
						});

						if (played) {
							break;
						}
					}
				}

				if (!played) {
					similar = candidate;

					break;
				}
			}

			if (!similar) {
				return closest();
			}

			const { body: { tracks: [result] } } = await superagent.get(`http://${player.node.host}:2333/loadtracks`)
				.query({
					identifier: `ytsearch:${similar.artist.name} ${similar.name}`,
				})
				.set('Authorization', player.node.password);

			if (!result) {
				return;
			}

			player.autoplayCache.set(similar.name, result.info.title);

			return result;
		} catch (e) {
			console.warn(e);
		}
	}

	/**
	 * Announces user level ups if their previous level !== current level
	 *
	 * @param {Member} member The member that got XP
	 * @param {Object} opts Options
	 * @param {Object} opts.previous The users previous xp profile
	 * @param {Object} opts.current The users current xp profile
	 * @param {Message} msg The message that they were leveled up by
	 * @param {Settings} settings The guild's settings
	 * @returns {Promise<void>}
	 */
	async levelup(member, {
		previous: { current: { level: previousLevel } },
		current: { current: { level: currentLevel } },
	}, msg, settings) {
		const { stack, rewards, notify } = settings.plugin('levels').options;

		if (rewards.length && msg.guild.me.permission.has('manageRoles')) {
			let shouldHave;

			if (stack) {
			// get all rewards < current level
				shouldHave = rewards
					.filter(r => r.level <= currentLevel)
					.map(({ content: roleId }) => msg.guild.roles.get(roleId))
					.filter(r => r)
				// we ain't adding more then two roles at once
					.slice(0, 2);
			} else {
				// get the reward closest to <= current level
				shouldHave = [rewards.reduce((prev, curr) => {
					if (curr.level > currentLevel) {
						return prev;
					}

					return Math.abs(curr.level - currentLevel) < Math.abs(prev.level - currentLevel) ? curr : prev;
				})]
					.map(({ content: roleId }) => msg.guild.roles.get(roleId))
					.filter(r => r);
			}

			for (const role of shouldHave) {
				if (member.roles.includes(role.id) || !member.guild.me.highestRole.higherThan(role)) {
					continue;
				}

				// give them the role
				await member.addRole(role.id, 'Level-up');
			}

			if (!stack && shouldHave.length) {
				const shouldntHave = rewards
					.filter(r => r.level < currentLevel)
					.map(({ content: roleId }) => member.guild.roles.get(roleId))
					.filter(r => r)
				// we ain't removing more then two roles at once
					.slice(0, 2);

				for (const role of shouldntHave) {
					if (!member.roles.includes(role.id) || !member.guild.me.highestRole.higherThan(role)) {
						continue;
					}

					await member.removeRole(role.id, 'Level-up');
				}
			}
		}

		// once we've made sure they have their rewards, we don't do shit
		// if they have higher level rewards we'll turn a blind eye incase an admin is hooking them up or something
		if (previousLevel === currentLevel) {
			return;
		}

		if (notify && notify.enabled && notify.content) {
			if (!msg.channel.permissionsOf(msg.guild.me.id).has('sendMessages')) {
				return;
			}

			const parser = new Parser({
				msg,
				settings,
			}, false);

			const { output } = await parser.parse(notify.content);

			if (!output) {
				return;
			}

			try {
				if (notify.dm) {
					return msg.author.createMessage(msg.channel.id, {
						content: output,
					});
				}

				return this.Atlas.client.createMessage(msg.channel.id, {
					content: output,
				});
			} catch (e) {} // eslint-disable-line no-empty
		}
	}
};
