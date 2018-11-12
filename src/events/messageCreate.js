const fs = require('fs');
const path = require('path');
const parseArgs = require('yargs-parser');

const prefixes = process.env.PREFIXES.split(',');

module.exports = class Ready {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.sitDown = new Map();
		this.filters = fs
			.readdirSync(path.join(__dirname, '../filters'))
			.map((f) => {
				const Prop = require(path.join(__dirname, '../filters', f));

				return (new Prop(this.Atlas));
			});
	}

	async execute(msg) {
		if (msg.type !== 0 || msg.author.bot) return;

		let settings;
		if (msg.guild) {
			settings = await this.Atlas.DB.getGuild(msg.guild.id);

			msg.lang = settings.lang;
			msg.displayPrefix = settings.prefix || process.env.DEFAULT_PREFIX;
		} else {
			([msg.displayPrefix] = prefixes);
			// temporary
			msg.lang = process.env.DEFAULT_LANG;
		}

		// user profile, currently does nothing but store avatars and usernames for dashboard things (see /lib/schemas/User)
		// no reason to do this as it's more or less just for usernames and avatars
		this.Atlas.util.updateUser(msg.author).catch(() => false);


		msg.prefix = this.checkPrefix(msg.content, settings);

		if (msg.prefix) { // eslint-disable-line no-extra-parens
			msg.args = msg.content.replace(/<@!/g, '<@').substring(msg.prefix.length).trim()
				.split(/ +/g);
			msg.label = msg.args.shift().toLowerCase();
			msg.command = this.Atlas.commands.get(msg.label);

			if (msg.command) {
				if (msg.command.info.subcommands.size !== 0 && msg.args[0]) {
					// handle subcommands
					const subLabel = msg.args[0].toLowerCase();
					const sub = msg.command.info.subcommands.get(subLabel)
						|| msg.command.info.subcommands.get(msg.command.info.subcommandAliases.get(subLabel));

					if (sub) {
						msg.args.shift();
						msg.command = sub;
					}
				}

				const uncleanOptions = parseArgs(msg.content);
				const parsedArgs = {};
				for (const arg of Object.keys(uncleanOptions)) {
					if (msg.command.info.allowAllFlags
						|| (msg.command.info.supportedFlags && msg.command.info.supportedFlags.map(a => a.name).includes(arg.toLowerCase()))) {
						parsedArgs[arg] = uncleanOptions[arg];
					}
				}

				if (msg.author.id === process.env.OWNER && this.Atlas.env === 'development') {
					msg.addReaction('🔁').catch(() => false);
				}

				return msg.command.execute(msg, msg.args, {
					settings,
					parsedArgs,
				});
			}

			this.Atlas.client.emit('message', msg);
		}

		if (msg.guild && settings) {
			for (const filter of this.Atlas.filters.values()) {
				const output = await filter.checkMessage(settings, msg);
				if (output === true) {
					break;
				}
			}

			// todo: make actions  take priority over default commands
			const actions = settings.actions.filter((a) => {
				if (a.trigger.type === 'label' && msg.label === a.trigger.content) {
					return true;
				}

				// i'm not sorry honestly
				if (
					a.trigger.type === 'keyword'
					&& (
						msg.content.toLowerCase().includes(a.trigger.content.toLowerCase())
						|| msg.cleanContent.toLowerCase().includes(a.trigger.content.toLowerCase())
					)
				) {
					return true;
				}

				return false;
			});

			for (const action of actions) {
				try {
					await action.execute(msg);
				} catch (e) {
					// todo: log to guild
					console.error(e);
				}
			}
		}
	}

	checkPrefix(msg, settings = {}) {
		const possiblePrefixes = settings.prefix
			? [settings.prefix, ...prefixes]
			: prefixes;

		for (let prefix of possiblePrefixes) {
			prefix = prefix.replace(/@mention/g, this.Atlas.client.user.mention);
			if (msg.startsWith(prefix)) {
				return prefix;
			}
		}
	}
};
