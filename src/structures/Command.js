const Responder = require('./Responder');
const cleanArgs = require('./../../lib/utils/cleanArgs');

class Command {
	constructor(Atlas, info) {
		this.Atlas = Atlas;
		this.raw = info;
		this.info = { ...{
			usage: null,
			aliases: [],
			cooldown: {
				min: 2000,
				default: 2000,
			},
			guildOnly: true,
			description: 'This command has no description!',
			fullDescription: 'This command has no full description!',
			isDefaultDesc: !info.fullDescription,
			hidden: false,
			permissions: {
				bot: {},
				user: {},
			},
			examples: [],
			noExamples: info.usage && !info.examples,
			supportedArgs: [],
			args: [],
			subcommands: new Map(),
			subcommandAliases: new Map(),
		},
		...info };

		this.execute = this.execute.bind(this);
		if (this.action) {
			this.action = this.action.bind(this);
		}
	}

	execute(msg, args, {
		settings,
		parsedArgs = {},
	}) {
		return new Promise((resolve, reject) => {
			const responder = new Responder(msg);

			if (settings) {
				// todo: check permission overwrites for the channel (maybe?)
				for (const permsKey of Object.keys(this.info.permissions || {})) {
					const permissions = Object.keys(this.info.permissions[permsKey]);
					for (const perm of permissions) {
						const permList = (permsKey === 'bot' ? msg.guild.me : msg.member).permission.json;
						if (!permList[perm]) {
							const missing = responder.format(`general.permissions.list.${perm}`);

							return responder.error(`general.permissions.permError.${permsKey}`, missing).send();
						}
					}
				}

				const options = settings.command(this.info.master ? this.info.master.info.name : this.info.name);
				if (options.disabled) {
					return responder.error('general.disabledCommand', settings.prefix, this.info.name).send();
				}
				if (options.blacklist.channels.includes(msg.channel.id)) {
					return responder.error('general.blacklisted.channel', settings.prefix, this.info.name).send();
				}
				if (
					options.blacklist.roles
						.some(id => msg.member.roles && msg.member.roles.includes(id))
				) {
					// one of their roles is blacklisted
					const roles = options.blacklist.roles.filter(id => msg.member.roles.includes(id));
					const names = roles.map(id => msg.guild.roles.get(id).name);

					return responder
						.error(
							`general.blacklisted.roles.${names.length !== 1 ? 'plural' : 'singular'}`,
							`\`@${names.join('`, `@')}\``,
							settings.prefix,
							this.info.name,
						)
						.send();
				}
			} else if (this.info.guildOnly === true && !msg.guild) {
				return responder.error('general.guildOnly').send();
			}

			const validated = {};

			// todo: validate args following info.args array

			Promise.resolve(this.action(msg, args, {
				settings,
				parsedArgs,
				...validated,
				get cleanArgs() {
					return cleanArgs(msg, args);
				},
			}))
				.then((res) => {
					const duration = new Date() - new Date(msg.createdAt);

					if (process.env.VERBOSE === 'true') {
						console.log(`${this.info.name} - ${msg.author.username} ${msg.author.id} ${duration}ms`);
					}

					return resolve(res);
				})
				.catch((e) => {
					console.error(e);
					if (e.status && e.response) {
						// it's /probably/ a superagent error
						responder.error('general.restError').send();
					} else {
						responder.error('general.errorExecuting').send();
					}

					return reject(e);
				});
		});
	}

	/**
	 * Converts the command info to a language
	 * @param {string} lang The locale to format with, defaults to "en-US"
	 * @returns {Object} the converted command info
	 */
	getInfo(lang = 'en-US') {
		const responder = new Responder(null, lang);

		let key;
		if (this.info.master) {
			key = `info.${this.info.master.info.name}.${this.info.name}`;
		} else if (this.info.subcommands.size !== 0) {
			key = `info.${this.info.name}.base`;
		} else {
			key = `info.${this.info.name}`;
		}

		return responder.format({
			stringOnly: false,
			lang,
			key,
		});
	}

	/**
	 * Generates a help embed for the command
	 * @param {Message} msg the message to pull data from
	 * @returns {Object} The embed
	 */
	helpEmbed(msg) {
		// TODO: localise properly
		const info = this.getInfo(msg.lang);

		const embed = {
			title: `${msg.displayPrefix}${this.info.master ? `${this.info.master.info.name} ${this.info.name}` : this.info.name}`,
			description: this.info.isDefaultDesc ? info.description : info.fullDescription || info.description,
			fields: [],
			timestamp: new Date(),
			footer: {},
		};

		if (this.info.subcommands && this.info.subcommands.size !== 0) {
			embed.fields.push({
				value: `**•** ${msg.displayPrefix}${this.info.name} ${Array.from(this.info.subcommands.values())
					.map(sub => sub.info.name)
					.join(`\n**•** ${msg.displayPrefix}${this.info.name} `)}`,
				name: 'Subcommands',
				inline: true,
			});
			embed.footer.text = `Do ${msg.displayPrefix}help ${this.info.name} <subcommand name> to view info about subcommands.`;
		}

		// todo: support examples from language files
		if (this.info.examples && this.info.examples.length) {
			const examples = this.info.examples.map(e => e
				.replace(/@sylver|@user/ig, msg.author.mention)
				.replace(/@random/ig, () => {
					if (msg.guild) {
						const members = Array.from(msg.guild.members);

						return members[Math.floor(Math.random() * members.length)][1].mention;
					}

					return msg.author.mention;
				}));
			if (examples.length > 5) {
				let col1;
				if (this.info.master) {
					col1 = examples.map(e => `${msg.displayPrefix + this.info.master} ${this.info.name} ${e}`);
				} else {
					col1 = examples.map(e => `${msg.displayPrefix + this.info.name} ${e}`);
				}
				const col2 = col1.splice(0, Math.floor((col1.length / 2)));

				embed.fields.push({
					name: 'Examples',
					value: col1.join('\n'),
					inline: true,
				}, {
					// This has a zero-width character in it
					name: '​',
					value: col2.join('\n'),
					inline: true,
				});
			} else if (this.info.master) {
				embed.fields.push({
					name: 'Examples',
					value: `${msg.displayPrefix + this.info.master.info.name} ${this.info.name} ${examples
						.join(`\n${msg.displayPrefix + this.info.master.info.name} ${this.info.name} `)}`,
				});
			} else {
				embed.fields.push({
					name: 'Examples',
					value: `${msg.displayPrefix + this.info.name} ${examples.join(`\n${msg.displayPrefix + this.info.name} `)}`,
				});
			}
		}

		if (this.info.aliases && this.info.aliases.length) {
			if (this.info.master) {
				embed.fields.push({
					name: 'Aliases',
					value: `**•** ${msg.displayPrefix}${this.info.master.info.name} ${this.info.aliases.join(`\n**•** ${msg.displayPrefix}`)}`,
					inline: true,
				});
			} else {
				embed.fields.push({
					name: 'Aliases',
					value: `**•** ${msg.displayPrefix}${this.info.aliases.join(`\n**•** ${msg.displayPrefix}`)}`,
					inline: true,
				});
			}
		}

		if (this.info.master) {
			embed.fields.push({
				name: 'Usage',
				value: `${msg.displayPrefix}${this.info.master.info.name} ${info.name} ${info.usage || ''}`,
				inline: true,
			});
		} else {
			embed.fields.push({
				name: 'Usage',
				value: `${msg.displayPrefix}${this.info.name} ${info.usage || ''}`,
				inline: true,
			});
		}

		if (this.info.permissions.user && Object.keys(this.info.permissions.user).length) {
			embed.fields.push({
				name: 'Permissions (User)',
				value: `\`${Object.keys(this.info.permissions.user)
					.map(p => this.Atlas.util.format(msg.lang, `general.permissions.list.${p}`))
					.join('`, `')}\``,
				inline: true,
			});
		}

		if (this.info.permissions.bot && Object.keys(this.info.permissions.bot).length) {
			embed.fields.push({
				name: 'Permissions (Bot)',
				value: `\`${Object.keys(this.info.permissions.bot)
					.map(p => this.Atlas.util.format(msg.lang, `general.permissions.list.${p}`))
					.join('`, `')}\``,
				inline: true,
			});
		}

		if (this.info.supportedFlags && this.info.supportedFlags[0]) {
			let supported = this.info.supportedFlags;

			if (msg.author.id !== process.env.OWNER) {
				supported = this.info.supportedFlags.filter(arg => !arg.dev);
			}

			const flags = supported.map((m) => {
				let str = `**•** \`--${m.name}\``;

				if (m.placeholder) {
					str += `\`--${m.name}="${m.placeholder}"\` `;
				} else {
					str += `\`--${m.name}\` `;
				}

				if (m.desc) {
					str += `- ${m.desc}`;
				}

				return str;
			});

			flags.sort((a, b) => b.length - a.length);

			embed.fields.push({
				name: 'Supported Flags',
				value: flags.join('\n'),
			});
		}

		embed.fields.forEach((f) => {
			f.name = f.name.replace(/@sylver/ig, msg.author.mention).replace(/@user/ig, msg.author.mention);
		});

		return embed;
	}
}

module.exports = Command;
