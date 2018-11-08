const mongoose = require('mongoose');
// idk about this 100% yet
const cachegoose = require('cachegoose');

if (process.env.REDIS_PASS) {
	cachegoose(mongoose, {
		engine: 'redis', /* If you don't specify the redis engine,      */
		port: Number(process.env.REDIS_PORT), /* the query results will be cached in memory. */
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASS,
	});
} else {
	console.warn('No "REDIS_PASS", disabling caching');
}
// allows Schema#findOneOrCreate(), Schema#updateOneOrCreate, caching stuff and sets strict to true (removes any unknown values that aren't in the schema)
mongoose.plugin((schema) => {
	// sets a timer on every find, findOne and findOneAndUpdate to 60s
	schema.pre(/^find/, function setTimer() {
		this.cache(60);
	});

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
		let settings = await this.Guild.findOne({ id });
		if (!settings) {
			settings = await this.Guild.create({ id });
		}

		if (this.GuildSettingsClass) {
			return new this.GuildSettingsClass(settings); // eslint-disable-line new-cap
		}

		return settings;
	}
}

module.exports = Database;
