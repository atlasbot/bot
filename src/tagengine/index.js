const tags = require('./loader')();
const interpreter = require('./interpreter');
const Parser = require('./Parser');
const Lexer = require('./lexer');

module.exports = class {
	/**
     *
     * @param {Object} data Data for the tags to pull information from
     * @param {Object} data.ticket The ticket to get info from
     * @param {Guild} data.guild The guild to get info from
     * @param {Channel} data.channel The channel to get info from
     * @param {Object} data.action The action that is being processed
     * @param {Object} data.user The user in context or something idk
     */
	constructor({
		msg,
		guild = msg.guild,
		// todo: try and get channel ourselves if it's not present
		ticket,
		channel = msg.channel,
		settings,
		action,
		user = msg.author,
	}) {
		this.data = {
			msg,
			ticket,
			guild,
			channel,
			settings,
			action,
			user,
		};

		this.tags = tags;
		this.Atlas = require('./../../Atlas');
	}

	async parse(source) {
		const ast = Lexer.lex(source);
		const parsed = await Parser.parse(ast);

		return interpreter(parsed, this.data, this.tags);
	}
};
