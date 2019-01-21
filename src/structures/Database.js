const monk = require('monk');
const Guild = require('eris/lib/structures/Guild');
const deepMerge = require('atlas-lib/lib/utils/deepMerge');

const monkMiddleware = require('../monkMiddleware');
const defaultSettings = require('../../data/defaultSettings.json');
const Settings = require('./Settings');

module.exports = class Database {
	constructor() {
		this.db = monk(process.env.MONGO_URI);

		this.db.addMiddleware(monkMiddleware);
	}

	get(db) {
		return this.db.get(db);
	}

	async settings(guild) {
		if (!guild.id || guild.unavailable) {
			throw new Error('Invalid or unavailable guild.');
		}
		const db = this.get('settings');

		let settings = await db.findOne({ id: guild.id });

		if (!settings) {
			settings = await db.insert({
				id: guild.id,
			});

			if (!settings) {
				throw new Error(`Error generating settings for ${guild.id}`);
			}
		}

		settings._id = settings._id.toString();

		const data = deepMerge(defaultSettings, settings);

		if (data.id !== guild.id) {
			// this may not be what's causing it, but there is some spoopy
			// behaviour where mongodb might be returning the wrong document for each guild
			throw new Error('Something spoopy happened.');
		}

		// cache for 120s
		// await cache.settings.set(id, data, CACHE_TIME_SECONDS);

		return new Settings(data, guild instanceof Guild && guild);
	}

	async user(user) {
		if (!user.id) {
			throw new Error('Invalid user');
		}

		const db = this.get('users');

		let profile = await db.findOne({ id: user.id });

		if (!profile) {
			const data = {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				discriminator: user.discriminator,
				guilds: [],
			};

			profile = await db.insert(data);
		}

		const data = {
			guilds: [],
			...profile,
		};

		// await cache.users.set(id, data, CACHE_TIME_SECONDS);

		return data;
	}
};
