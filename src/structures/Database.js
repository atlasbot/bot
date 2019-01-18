const monk = require('monk');
const Guild = require('eris/lib/structures/Guild');
const Cache = require('atlas-lib/lib/structures/Cache');
const deepMerge = require('atlas-lib/lib/utils/deepMerge');

const defaultSettings = require('../../data/defaultSettings.json');
const Settings = require('./Settings');

const cache = {
	settings: new Cache('settings'),
	users: new Cache('users'),
};

// how long to cache users and guild settings for in seconds
// for now this is very low because the dashboard doesn't clear the cache properly on update
const CACHE_TIME_SECONDS = 10;

module.exports = class Database {
	constructor() {
		this.db = monk(process.env.MONGO_URI);
	}

	get(db) {
		return this.db.get(db);
	}

	async settings(guild) {
		const id = guild.id || guild;

		const cached = await cache.settings.get(id);
		if (cached) {
			return new Settings(cached, guild instanceof Guild && guild);
		}

		const db = this.get('settings');

		let settings = await db.findOne({ id });

		if (!settings) {
			const data = typeof guild === 'string' ? { id: guild } : {
				id: guild.id,
			};

			const { _id: documentId } = await db.insert(data);

			settings = await db.findOne({ _id: documentId });
		}

		settings._id = settings._id.toString();

		const data = deepMerge(defaultSettings, settings);

		// cache for 120s
		await cache.settings.set(id, data, CACHE_TIME_SECONDS);

		return new Settings(data, guild instanceof Guild && guild);
	}

	async user(user) {
		const id = user.id || user;

		const cached = await cache.users.get(id);
		if (cached) {
			return cached;
		}

		const db = this.get('users');

		let profile = await db.findOne({ id });

		if (!profile) {
			const data = typeof user === 'string' ? { id: user } : {
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

		await cache.users.set(id, data, CACHE_TIME_SECONDS);

		return data;
	}
};
