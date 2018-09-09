const mongoose = require('mongoose');
const Settings = require('./Settings');

const {
	UserSchema,
	GuildSchema,
	ActionSchema,
	TicketSchema,
	InfractionSchema,
	SuggestionSchema,
} = require('./../schemas/index.js');

class Database {
	constructor({
		user,
		pass,
		host,
	}) {
		this.uri = `mongodb://${user}:${pass}@${host}`;
		this.ready = false;
		this.connection = null;
		this.User = mongoose.model('User', UserSchema);
		this.Guild = mongoose.model('Guild', GuildSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Ticket = mongoose.model('Ticket', TicketSchema);
		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.Suggestion = mongoose.model('Suggestion', SuggestionSchema);
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

		return new Settings(settings);
	}
}

module.exports = Database;
