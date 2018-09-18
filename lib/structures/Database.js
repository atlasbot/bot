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

let registered;
try {
	mongoose.model('Guild');
	registered = true;
	console.log('Models are already registered.');
} catch (e) {
	console.log('Registering models...');
}

class Database {
	constructor({
		user,
		pass,
		host,
	}) {
		this.uri = `mongodb://${user}:${pass}@${host}`;
		this.ready = false;
		this.mongoose = null;
		this.connection = null;
		this.User = mongoose.model('User', !registered && UserSchema);
		this.Guild = mongoose.model('Guild', !registered && GuildSchema);
		this.Action = mongoose.model('Action', !registered && ActionSchema);
		this.Ticket = mongoose.model('Ticket', !registered && TicketSchema);
		this.Infraction = mongoose.model('Infraction', !registered && InfractionSchema);
		this.Suggestion = mongoose.model('Suggestion', !registered && SuggestionSchema);
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
