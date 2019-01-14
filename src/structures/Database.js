const monk = require('monk');
const deepMerge = require('atlas-lib/lib/utils/deepMerge');

const defaultSettings = require('../../data/defaultSettings.json');
const Settings = require('./Settings');

module.exports = class Database {
	constructor() {
		this.db = monk(process.env.MONGO_URI);
	}

	get(db) {
		return this.db.get(db);
	}

	async settings(guild) {
		const db = this.get('settings');

		let settings = await db.findOne({ id: guild.id || guild });

		if (!settings) {
			const data = typeof guild === 'string' ? { id: guild } : {
				id: guild.id,
			};

			const { _id: documentId } = await db.insert(data);

			settings = await db.findOne({ _id: documentId });
		}

		settings._id = settings._id.toString();

		const data = deepMerge(defaultSettings, settings);

		return new Settings(data);
	}

	async user(user) {
		const db = this.get('users');

		let profile = await db.findOne({ id: user.id || user });

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

		return {
			guilds: [],
			...profile,
		};
	}
};
