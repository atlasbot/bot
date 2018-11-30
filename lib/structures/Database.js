const mongoose = require('mongoose');

const Cache = require('./Cache');

const cache = new Cache('db');

// allows Schema#findOneOrCreate(), Schema#updateOneOrCreate
mongoose.plugin((schema) => {
	schema.statics.findOneOrCreate = async function findOneOrCreate(find, create) {
		const result = this.findOne(find);

		return result || this.create(create);
	};

	schema.statics.updateOneOrCreate = async function updateOneOrCreate(query, data) {
		const result = await this.updateOne(query, data);

		if (result.nModified !== 0) {
			return result;
		}

		return this.create(data);
	};
});

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
		this.uri = connectionUri || process.env.MONGO_URI;
		this.ready = false;
		this.mongoose = null;
		this.connection = null;
		this.Guild = mongoose.model('Guild', GuildSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.User = mongoose.model('User', UserSchema);
		// this is used for the api and dashboard but they can't use the guild settings class, so it's optional
		this.GuildSettingsClass = GuildSettingsClass;
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
		await cache.set(id, settings, 30);

		if (this.GuildSettingsClass) {
			return new this.GuildSettingsClass(settings); // eslint-disable-line new-cap
		}

		return settings;
	}
}

module.exports = Database;
