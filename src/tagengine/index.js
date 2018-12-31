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

		this.settings = settings;

		this.tags = tags;

		// janky "temporary" way for tag aliases that will probably never be replaced :^)
		this.tags.get = (key) => {
			if (!key) {
				return;
			}
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
								content: `${settings.prefix}${label} ${args.join(' ')}`.trim(),
								timestamp: msg.timestamp || Date.now(),
							}, args, {
								settings,
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
		const volatile = new Map();

		const persistent = new Map(this.settings.raw.persistent);

		if (!this.settings.raw.persistent) {
			this.settings.raw.persistent = [];
		}

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

		const data = await interpreter(parsed, {
			...this.context,
			volatile,
			persistent,
		}, this.tags);

		if (data.output && this.context.guild && ['#', '@', ':'].some(c => data.output.includes(c))) {
			data.output = data.output.replace(/#[A-z0-9_-]*/g, (match) => {
				const channel = this.context.guild.channels.find(c => c.name === match);

				if (channel) {
					return channel.mention;
				}

				return match;
			});

			data.output = data.output.replace(/@[A-z0-9_-]*/g, (match) => {
				const role = this.context.guild.roles.find(c => c.name === match);

				if (role) {
					return role.mention;
				}

				return match;
			});

			data.output = data.output.replace(/:[a-zA-Z0-9_-]*:/g, (match, index) => {
				const gEmoji = this.context.guild.emojis.find(e => e.name === match);

				// The index thing here is to not garble up emojis that have been parsed by Discord already
				if (gEmoji && gEmoji.name && gEmoji.id && data.output[index - 1] !== '<') {
					return `<:${gEmoji.name}:${gEmoji.id}>`;
				}

				const emoji = this.Atlas.lib.emoji.get(match);
				if (emoji) {
					return emoji.char;
				}

				return match;
			});
		}

		const modified = source.includes('perset') || (persistent.size !== this.settings.raw.persistent.length);

		if (modified) {
			// persistent storage was modified, save that shit
			await this.settings.update({
				persistent: Array.from(persistent),
			});
		}

		return data;
	}
};
