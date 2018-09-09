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
		if (msg.type !== 0) return;

		let settings;
		if (msg.guild) {
			settings = await this.Atlas.DB.getGuild(msg.guild.id);
			msg.lang = settings.lang;
			msg.displayPrefix = settings.prefix || prefixes[0];
		} else {
			msg.displayPrefix = prefixes[0]; // eslint-disable-line prefer-destructuring
			msg.lang = 'en-US';
		}

		// TODO: filter checks, make sure it tries msg.cleanContent and msg.content

		msg.prefix = this.checkPrefix(msg.content, settings);
		if (msg.prefix) { // eslint-disable-line no-extra-parens
			msg.args = msg.content.replace(/<@!/g, '<@').substring(msg.prefix.length).trim()
				.split(/ +/g);
			msg.label = msg.args.shift().toLowerCase();
			msg.command = this.Atlas.commands.get(msg.label);
			if (!msg.command) {
				const corrected = (new this.Atlas.structs.Fuzzy(Array.from(this.Atlas.commands.labels.values()), {
					keys: ['info.name'],
				})).search(msg.label);
				if (corrected && corrected.info.autocorrect) {
					msg.command = corrected;
				}
			}
			if (msg.command) {
				if (msg.command.info.subcommands.size !== 0 && msg.args[0]) {
					// handle subcommands
					const subLabel = msg.args[0].toLowerCase();
					const sub = msg.command.info.subcommands.get(subLabel);
					if (sub) {
						msg.args.shift();
						msg.command = sub;
					}
				}
				const uncleanOptions = parseArgs(msg.content);
				const parsedArgs = {};
				for (const arg of Object.keys(uncleanOptions)) {
					if (msg.command.info.supportedArgs.includes(arg.toLowerCase())) {
						parsedArgs[arg] = uncleanOptions[arg];
					}
				}
				if (msg.author.id === '111372124383428608' && this.Atlas.env === 'development') {
					msg.addReaction('🔁').catch(() => false);
				}
				msg.command.execute(msg, msg.args, {
					settings,
					parsedArgs,
				});
			} else {
				// TODO: look for a custom command that matches the label
			}

			this.Atlas.client.emit('message', msg);
		}
	}

	checkPrefix(msg, guild = {}) {
		const possiblePrefixes = guild.prefix
			? [guild.prefix, ...prefixes]
			: prefixes;

		// if (msg.guild && msg.guild.settings && msg.guild.settings.prefix && msg.guild.settings.prefix !== undefined) {
		// 	if (msg.content.startsWith(msg.guild.settings.prefix)) return msg.guild.settings.prefix;
		// }

		for (let prefix of possiblePrefixes) {
			prefix = prefix.replace(/@mention/g, this.Atlas.client.user.mention);
			if (msg.startsWith(prefix)) {
				return prefix;
			}
		}
	}
};
