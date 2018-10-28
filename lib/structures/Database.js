const mongoose = require('mongoose');

const {
	GuildSchema,
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
