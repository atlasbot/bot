const mongoose = require('mongoose');

const Cache = require('./Cache');

const cache = new Cache('db');

const {
	GuildSchema,
	UserSchema,
	InfractionSchema,
	ActionSchema,
} = require('./../schemas/index.js');

class Database {
	constructor({
		connectionUri,
		GuildSettingsClass,
	}) {
		// general DB info
		this.uri = connectionUri || process.env.MONGO_URI;
		this.ready = false;
		this.mongoose = null;
		this.connection = null;
		// schemas
		this.Guild = mongoose.model('Guild', GuildSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.User = mongoose.model('User', UserSchema);
		// this is used for the api and dashboard but they can't use the guild settings class, so it's optional
		this.GuildSettingsClass = GuildSettingsClass;
		// cache, incase something has to be cleared or updated
		this.cache = cache;
	}

	async init() {
		await mongoose.connect(this.uri, {
			useNewUrlParser: true,
		});
		this.ready = true;

		return this.ready;
	}

	async getGuild(guild) {
		const id = guild.id || guild;

		const existing = await cache.get(id);
		if (existing) {
			return this.GuildSettingsClass ? new this.GuildSettingsClass(existing) : existing;
		}

		let settings = await this.Guild.findOne({ id });

		if (!settings) {
			settings = await this.Guild.create({ id });
		}

		// cache for 30s
		await cache.set(id, settings, 5);

		if (this.GuildSettingsClass) {
			return new this.GuildSettingsClass(settings); // eslint-disable-line new-cap
		}

		return settings;
	}

	async getProfile(data) {
		const id = data.id || data;

		const existing = await cache.get(id);

		if (existing) {
			return existing;
		}

		let profile = await this.User.findOne({ id });

		if (!profile) {
			profile = await this.User.create(data.id ? data : { id });
		}

		const obj = profile.toObject();

		await cache.set(id, obj, 60);

		return obj;
	}
}

module.exports = Database;
