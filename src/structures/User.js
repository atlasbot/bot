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
		const profile = this.guilds.find(g => g.id === id);

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
