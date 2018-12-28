const tags = require('./loader')();
const interpreter = require('./interpreter');
const Parser = require('./Parser');
const Lexer = require('./lexer');

module.exports = class {
	/**
     *
     * @param {Object} data Data for the tags to pull information from
     * @param {Guild} data.guild The guild to get info from
     * @param {Channel} data.channel The channel to get info from
     * @param {Object} data.action The action that is being processed
     * @param {Object} data.user The user in context or something idk
		 * @param {boolean} managed Whether to manage errors and other things.
     */
	constructor({
		msg,
		guild = msg ? msg.guild : undefined,
		channel = msg ? msg.channel : undefined,
		settings,
		action,
		user = msg.author,
	}, managed = true) {
		this.Atlas = require('./../../Atlas');

		this.context = {
			msg,
			guild,
			channel,
			settings,
			action,
			user,
			tag: true,
			Atlas: this.Atlas,
		};

		// coming soon to a parser near you
		this.managed = managed;

		this.tags = tags;

		// janky "temporary" way for tag aliases that will probably never be replaced :^)
		this.tags.get = (key) => {
			// in dev environments prefix is different, but i want compat so 'a!',
			//  also pre-v8 used 'a!' no matter what so more compat
			const prefix = ['a!', process.env.DEFAULT_PREFIX, settings.prefix].find(p => key.startsWith(p));

			if (prefix) {
				const label = key.substring(prefix.length);
				const command = this.Atlas.commands.get(label);

				if (command) {
					return {
						execute: async (context, args) => {
							await command.execute({
								...context,
								type: 0,
								author: user,
								member: guild.members.get(user.id),
								lang: settings.lang,
								prefix: settings.prefix,
								displayPrefix: settings.prefix,
								timestamp: msg.timestamp || Date.now(),
							}, args, {
								settings,
								parsedArgs: {},
							});
						},
						info: {
							name: key,
							description: `Tag wrapper for "${command.info.name}": ${command.getInfo(settings.lang).description}`,
							dependencies: ['guild', 'channel', 'user'],
							examples: [{
								input: `{${prefix}${label}}`,
								output: '',
								note: `The "${label}" command would run and output in a separate message.`,
							}],
						},
					};
				}
			}

			const val = Map.prototype.get.call(this.tags, key);

			return val;
		};
	}

	async parse(source) {
		if (!source || !source.includes('{')) {
			if (!source && process.env.VERBOSE) {
				console.warn(new Error('No source, returning nothing'));
			}

			return {
				output: source || '',
				errors: [],
			};
		}

		const ast = Lexer.lex(source);

		const parsed = await Parser.parse(ast);

		return interpreter(parsed, this.context, this.tags);
	}
};
