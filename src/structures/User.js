module.exports = class {
	constructor(raw) {
		const {
			id,
			username,
			avatar,
			discriminator,
			guilds = [],
		} = raw;

		this.id = id;
		this.username = username;
		this.avatar = avatar;
		this.discriminator = discriminator;
		this.guilds = guilds;
		this.raw = raw;

		this.Atlas = require('../../Atlas');
	}

	/**
	 * Get a profile for a guild
	 *
	 * @param {string} id The ID of the guild to get the profile for
	 * @param {boolean} createPseudo Whether to return a pseudo-profile when one doesn't exist.
	 * @returns {Promise<Object>}
	 */
	guildProfile(id, createPseudo = true) {
		let profile;

		const profiles = this.guilds.filter(g => g.id === id);

		if (profiles.length > 1) {
			// AFAIK pre-8.0.69 things didn't play nice and some duplicate profiles were created.
			// this fixes any that are found and removes duplicate profiles
			const highest = profiles.reduce((prev, curr) => (prev.xp > curr.xp ? prev : curr), profiles[0]);
			const xp = profiles.reduce((prev, curr) => prev.xp + curr.xp);

			const others = this.guilds.filter(g => g.id !== id);

			// add up all profiles XP and add them to the "primary" profile so we don't lose any XP
			highest.xp = xp;

			profile = highest;

			// update the profile with the merged data
			this.update({
				guilds: [
					...others,
					profile,
				],
			});
		} else {
			([profile] = profiles);
		}

		if (profile || !createPseudo) {
			return profile;
		}

		return {
			id,
			messages: 0,
			xp: 0,
			pseudo: true,
		};
	}

	/**
	 * Formats a user into a savable profile
	 * @param {Object|User} user The user/user's info to format
	 * @returns {Object} The profile that should be up to date
	 */
	schema(user) {
		return this.Atlas.DB.userSchema(user);
	}

	/**
	 * Ensures that our internal data is the same as the user's actual data
	 *
	 * @param {User|Member} author The user to sync
	 */
	async sync(author) {
		if (author.id !== this.id) {
			throw new Error('User ID\'s do not match.');
		}

		return this.Atlas.DB.syncUser(author);
	}

	/**
	 * Update the user's profile
	 *
	 * @param {Object} payload The things to update. MongoDB operators supported.
	 * @param {Object} [query={ id: this.id }] The optional query incase you want to edit a guild profile or some shit.
	 * @returns {Promise<Object>} The updated profile
	 */
	async update(payload, query = { id: this.id }) {
		const ret = await this.Atlas.DB.updateUser(this, payload, query);

		if (!ret) {
			return ret;
		}

		this.guilds = ret.guilds;

		return ret;
	}
};
