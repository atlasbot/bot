const Message = require('eris/lib/structures/Message');
const Permission = require('eris/lib/structures/Permission');
const { Permissions } = require('eris/lib/Constants');

const tags = require('./loader')();
const interpreter = require('./interpreter');
const Parser = require('./Parser');
const Lexer = require('./lexer');

const RETURN_ID_REGEX = /--?returnId((?:=)?('|")true('|"))?/;

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

		if (!msg) {
			if (!channel.permissionsOf) {
				channel.permissionsOf = () => new Permission(Permissions.all);
			}

			msg = {
				guild,
				channel,
				author: user,
				type: 0,
				timestamp: Date.now(),
				lang: settings.lang,
				content: '???',
				prefix: settings.prefix,
				displayPrefix: settings.prefix,
			};
		}

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
						execute: async (context, args = []) => {
							let returnId = false;

							const argIndex = args.findIndex(a => RETURN_ID_REGEX.test(a));

							if (argIndex !== -1) {
								args.splice(argIndex, 1);

								returnId = true;
							}

							if (!context.channel.permissionsOf) {
								context.channel.permissionsOf = () => new Permission(Permissions.all);
							}

							if (!context.channel.guild) {
								context.channel.guild = context.guild;
							}

							const outMsg = await command.execute({
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

							if (outMsg instanceof Message && returnId) {
								return outMsg.id;
							}
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
			if (!source && process.env.VERBOSE === 'true') {
				console.warn(new Error('No source, returning nothing'));
			}

			return this.replace({
				output: source || '',
				errors: [],
			});
		}

		const ast = Lexer.lex(source);

		const parsed = await Parser.parse(ast);

		const data = await interpreter(parsed, {
			...this.context,
			volatile,
			persistent,
		}, this.tags);

		const modified = source.includes('perset') || (persistent.size !== this.settings.raw.persistent.length);

		if (modified) {
			// persistent storage was modified, save that shit
			await this.settings.update({
				$set: {
					persistent: Array.from(persistent),
				},
			});
		}

		return this.replace(data);
	}

	/**
	 * Replaces channel/role mentions and emojis in the output
	 * @param {Object} data data
	 * @returns {Object}
	 */
	replace(data) {
		if (!data || !data.output) {
			return data;
		}

		data.output = data.output
			.replace(/#([a-zA-Z0-9_-]*)/ig, (ignore, match) => {
				const channels = Array.from(this.context.guild.channels.values());
				const channel = channels.find(m => m.name.toLowerCase().trim() === match.toLowerCase().trim());

				if (channel && channel.mention) return channel.mention;

				return ignore;
			})
			.replace(/@([a-zA-Z0-9_-]*)/ig, (ignore, match) => {
				const roles = Array.from(this.context.guild.roles.values());
				const role = roles.find(m => m.name.toLowerCase() === match.toLowerCase());

				if (role && role.mention) return role.mention;

				const members = Array.from(this.context.guild.members.values());
				const member = members.find(m => m.username.toLowerCase() === match.toLowerCase());

				if (member && member.mention) return member.mention;

				return ignore;
			})
			.replace(/:([a-zA-Z0-9_-]*):/mg, (ignore, match, index) => {
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

		return data;
	}
};
