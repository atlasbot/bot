const mongoose = require('mongoose');

const Cache = require('./Cache');

const {
	SettingsSchema,
	UserSchema,
	InfractionSchema,
	ActionSchema,
	PlaylistSchema,
} = require('./../schemas/index.js');

class Database {
	constructor({
		connectionUri,
		SettingsStruct,
	}) {
		// general DB info
		this.uri = connectionUri || process.env.MONGO_URI;
		this.ready = false;
		this.mongoose = null;
		this.connection = null;
		// schemas
		this.Playlist = mongoose.model('Playlist', PlaylistSchema);
		this.Settings = mongoose.model('Settings', SettingsSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.User = mongoose.model('User', UserSchema);
		// this is used for the api and dashboard but they can't use the guild settings class, so it's optional
		this.SettingsStruct = SettingsStruct;
		// cache, incase something has to be cleared or updated
		this.cache = new Cache('db');
	}

	async init() {
		await mongoose.connect(this.uri, {
			useNewUrlParser: true,
		});
		this.ready = true;

		return this.ready;
	}

	async getSettings(guild) {
		const id = guild.id || guild;

		const existing = await this.cache.get(id);
		if (existing) {
			return this.SettingsStruct ? new this.SettingsStruct(existing) : existing;
		}

		let settings = await this.Settings.findOne({ id });

		if (!settings) {
			settings = await this.Settings.create({ id });
		}

		// cache for 30s
		await this.cache.set(id, settings, 5);

		if (this.SettingsStruct) {
			return new this.SettingsStruct(settings); // eslint-disable-line new-cap
		}

		return settings;
	}

	async getProfile(data) {
		const id = data.id || data;

		const existing = await this.cache.get(id);

		if (existing) {
			return existing;
		}

		let profile = await this.User.findOne({ id });

		if (!profile) {
			profile = await this.User.create(data.id ? data : { id });
		}

		const obj = profile.toObject();

		await this.cache.set(id, obj, 60);

		return obj;
	}
}

module.exports = Database;
