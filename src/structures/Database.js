const mongoose = require('mongoose');
const assert = require('assert');

// lib stuff
const capitalize = require('atlas-lib/lib/utils/capitalize');

// mongoose models
const InfractionSchema = require('atlas-lib/lib/models/Infraction');
const TranscriptSchema = require('atlas-lib/lib/models/Transcript');
const SettingsSchema = require('atlas-lib/lib/models/Settings');
const PlaylistSchema = require('atlas-lib/lib/models/Playlist');
const ActionSchema = require('atlas-lib/lib/models/Action');
const TicketSchema = require('atlas-lib/lib/models/Ticket');
const UserSchema = require('atlas-lib/lib/models/User');

const Settings = require('./Settings');
const User = require('./User');
const cache = require('../cache');

const CACHE_TIME_SECONDS = 300;

/** database layer */
module.exports = class Database {
	/**
	 * Creates an instance of Database.
	 * @param {string} [MONGO_URI=process.env.MONGO_URI] A MongoDB connection URI of a database to connect to
	 * @param {boolean} debugOverride Overrides setting mongoose debug to true
	 */
	constructor(MONGO_URI = process.env.MONGO_URI, debugOverride) {
		mongoose.connect(MONGO_URI);

		mongoose.set('debug', typeof debugOverride === 'boolean' ? debugOverride : true);

		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.Transcript = mongoose.model('Transcript', TranscriptSchema);
		this.Settings = mongoose.model('Settings', SettingsSchema);
		this.Playlist = mongoose.model('Playlist', PlaylistSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Ticket = mongoose.model('Ticket', TicketSchema);
		this.User = mongoose.model('User', UserSchema);

		// not just used here
		// cache for 5m
		this.CACHE_TIME_SECONDS = 300;

		this.Atlas = require('../../Atlas');
	}

	/**
	 * Get a collection by name
	 * @param {string} collection The collection name
	 * @returns {Model} The mongoose model that you can run shit with
	 * @deprecated
	 */
	get(collection) {
		const name = capitalize(collection);
		const other = name.substring(0, name.length - 1);

		return this[name] || this[other];
	}

	/**
	 * Gets a guild's settings
	 *
	 * @param {Guild} guild The guild to get the settings for
	 * @returns {Promise<Settings>} The settings for the guild
	 */
	async getGuild(guild) {
		if (!guild.id || guild.unavailable) {
			throw new Error('Invalid or unavailable guild.');
		}

		const cached = await cache.settings.get(guild.id);
		if (cached) {
			return new Settings(cached, guild);
		}

		let settings = await this.Settings.findOne({ id: guild.id });

		if (!settings) {
			settings = await this.Settings.create({
				id: guild.id,
			});

			if (!settings) {
				throw new Error(`Error generating settings for ${guild.id}`);
			}
		}

		if (settings.id !== guild.id) {
			// this may not be what's causing it, but there is some spoopy
			// behaviour where mongodb might be returning the wrong document for each guild
			throw new Error('Something spoopy happened.');
		}

		const ret = settings.toObject ? settings.toObject() : settings;

		await cache.settings.set(guild.id, ret, CACHE_TIME_SECONDS);

		return new Settings(ret, guild);
	}

	/**
	 * Get a user's profile
	 *
	 * @param {User|Object} user The user to get the profile for
	 * @param {boolean} [raw=false] Whether to return the raw object
	 * @returns {Promise<User>}
	 */
	async getUser(user, raw = false) {
		if (!user.id) {
			throw new Error('Invalid user');
		}

		const cached = await cache.users.get(user.id);
		if (cached) {
			if (raw) {
				return cached;
			}

			return new User(cached);
		}

		let profile = await this.User.findOne({ id: user.id });

		if (!profile) {
			const data = {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				discriminator: user.discriminator,
				guilds: [],
			};

			profile = await this.User.create(data);
		}

		if (profile && profile.toObject) {
			profile = profile.toObject();
		}

		await cache.users.set(user.id, profile, CACHE_TIME_SECONDS);

		if (raw) {
			return profile;
		}

		return new User(profile);
	}

	/**
	 * Update a user
	 *
	 * @param {User|Object} user The user to update
	 * @param {*} payload The payload with mongodb operators or whatever
	 * @param {Object} [query={ id: user.id }] The optional query
	 * @returns {Promise<Object>} The updated user
	 */
	async updateUser(user, payload, query = { id: user.id }) {
		if (query.id !== user.id) {
			throw new Error('Query ID mismatch');
		}

		let ret = await this.User.findOneAndUpdate(query, payload, {
			new: true,
		});

		if (ret && ret.toObject) {
			ret = ret.toObject();
		}

		await cache.users.set(user.id, ret, CACHE_TIME_SECONDS);

		return ret;
	}

	/**
	 * Sync a user profile with their actual profile
	 *
	 * @param {User|Member} author The user to update the profile of
	 * @param {User} [profile=await this.getUser(author)] The user's profile
	 */
	async syncUser(author, profile) {
		if (author.user) {
			author = author.user;
		}

		if (!profile) {
			profile = await this.getUser(author, true);
		}

		if (profile.toObject) {
			profile = profile.toObject();
		}

		const toSave = this.userSchema(author);

		try {
			// throws if the objects are not the same
			assert.deepStrictEqual({
				...profile,
				...toSave,
			}, profile);
		} catch (e) {
			this.updateUser(profile, toSave).catch(console.warn);
		}
	}

	/**
	 * Convert a user to a standardised profile
	 * @param {User|Object} user The user to convert
	 * @returns {Object} the formatted user
	 */
	userSchema(user) {
		return {
			id: user.id,
			avatar: user.avatar,
			username: user.username,
			discriminator: user.discriminator,
		};
	}

	/**
	 * Get a ticket by a guild and channel
	 *
	 * @param {string} guild The guild ID the ticket is in
	 * @param {string} channelId The channel ID the ticket is binded to
	 * @returns {Promise<Object>}
	 */
	async getTicket(guild, channelId) {
		const key = `${guild.id}.${channelId}`;

		let ticket = await cache.tickets.get(key);

		if (!ticket) {
			ticket = await this.Ticket.findOne({ guild: guild.id, channel: channelId });

			if (!ticket) {
				return;
			}

			ticket = ticket.toObject();

			if (!guild.channels.has(ticket.channel)) {
				// the tickets channel was deleted, this just cleans things up
				return this.deleteTicket(guild.id, channelId);
			}

			await cache.tickets.set(key, ticket, CACHE_TIME_SECONDS);
		}

		const channel = guild.channels.get(ticket.channel);

		if (!channel) {
			return this.deleteTicket(guild.id, channelId);
		}

		return {
			...ticket,
			channel,
		};
	}

	/**
	 * Create a brand new ticket
	 *
	 * @param {Object} ticket The ticket
	 * @param {string} ticket.guild The guild the ticket is for
	 * @param {string} ticket.author The ticket author
	 * @param {string} ticket.channel The channel the ticket is binded to
	 * @param {string} [ticket.reason=] The reason for the ticket
	 * @returns {Promise<Object>} The ticket
	 */
	async createTicket(ticket) {
		const data = await this.Ticket.create(ticket);

		return data;
	}

	/**
	 * Delete a ticket
	 *
	 * @param {string} guild The guild of the ticket
	 * @param {string} channel The channel the ticket is binded to
	 */
	async deleteTicket(guild, channel) {
		const key = `${guild}.${channel}`;

		await this.Ticket.deleteOne({ guild, channel });

		await cache.tickets.del(key);
	}
};
