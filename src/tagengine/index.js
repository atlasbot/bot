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
     * @param {Object} data.command The command that is being processed
     */
	constructor({
		// todo: try and get ticket ourselves if it's not present
		ticket,
		guild,
		// todo: try and get channel ourselves if it's not present
		channel,
		settings,
		action,
	}) {
		this.data = {
			ticket,
			guild,
			channel,
			settings,
			action,
		};

		this.tags = tags;
		this.Atlas = require('./../../Atlas');
	}

	async parse(source) {
		const ast = Lexer.lex(source);
		const parsed = await Parser.parse(ast);

		return {
			errors: [],
			output: await interpreter(parsed, this.data, this.tags),
		};
	}
};
