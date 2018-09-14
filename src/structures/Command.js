const Responder = require('./Responder');

const prot = [
	'guild',
	'parsedArgs',
];

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
			requirements: {
				userIDs: [],
				permissions: {
					bot: {},
					user: {},
				},
			},
			examples: [],
			noExamples: info.usage && !info.examples,
			supportedArgs: [],
			args: [],
			subcommands: new Map(),
		},
		...info };

		this.cooldowns = new Map();

		this.subcommandAliases = new Map();

		this.execute = this.execute.bind(this);
		this.prompts = [];
		if (this.action) {
			this.action = this.action.bind(this);
		}
	}

	execute(msg, args, {
		settings,
		parsedArgs,
	}) {
		return new Promise((resolve, reject) => {
			const responder = new Responder(msg);

			if (settings) {
				const permCheck = this.permCheck(msg);
				// FIXME: this is fucked
				if (permCheck !== 2) {
					if (permCheck === 1) {
						return responder.error('general.botPermError').send();
					} if (permCheck === 0) {
						return responder.error('general.noPermission').send();
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
			if (this.info.args) {
				for (let i = 0; i < this.info.args.length; i++) {
					const test = this.info.args[i];
					const arg = args[i];
					if (prot.includes(test.label)) {
						throw new Error(`${test.label} is a protected argument label.`);
					}
					if (!arg) {
						if (test.prompt) {
							// TODO: prompt the user for the shit & use if/else below
						}
						if (test.errorMsg) {
							return responder.error(test.errorMsg).send();
						}

						return responder.embed(this.helpEmbed(msg)).send();
					} if (test.typeof) {
						if (test.typeof === 'number' || test.typeof === 'num') {
							if (isNaN(arg)) {
								// TODO: make more user friendly
								return responder.error(`Argument ${i + 1} must be a number!`).send();
							}
							const num = Number(arg);
							if (test.min && num < test.min) {
								return responder.error(`Argument ${i + 1} must be lower then ${test.min}!`);
							} if (test.max && num > test.max) {
								return responder.error(`Argument ${i + 1} must be higher then ${test.max}!`);
							}
							validated[test.label] = num;
						}
					}
					if (!validated[test.label]) {
						validated[test.label] = arg;
					}
				}
			}

			Promise.resolve(this.action(msg, args, {
				settings,
				parsedArgs,
				...validated,
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
	 * Checks permissions for the command
	 * @param {Message} msg The message with a "msg.member" key to get permissions from
	 * @returns {Boolean} if true, the user has valid permission to run the command. If false, the user does not.
	 */
	// TODO: test implementation
	permCheck(msg) {
		if (!this.info.requirements) return;
		if (this.info.requirements.user) {
			const memberPerms = msg.member.permission.json;
			const required = Object.keys(this.info.requirements.permissions.user)
				.filter(k => this.info.requirements.permissions.user[k]);
			if (required.length !== 0 && required.some(k => !memberPerms[k])) {
				return 0;
			}
		}
		if (this.info.requirements.bot) {
			const botPerms = msg.guild.me.permission.json;
			const required = Object.keys(this.info.requirements.permissions.bot)
				.filter(k => this.info.requirements.permissions.bot[k]);
			if (required.length !== 0 && required.some(k => !botPerms[k])) {
				return 1;
			}
		}
		if (this.info.requirements.userIDs) {
			const ids = this.info.requirements.userIDs;
			if (ids.length !== 0 && !ids.includes(msg.member.id)) {
				return 0;
			}
		}

		return 2;
	}

	/**
	 * Converts the command info to a language
	 * @param {string} lang The locale to format with, defaults to "en-US"
	 * @returns {Object} the converted command info
	 */
	getInfo(lang = 'en-US') {
		const responder = new Responder(null, lang);

		return {
			...this.info,
			...responder._parseObject({
				description: this.info.description,
				fullDescription: this.info.fullDescription,
				usage: this.info.usage,
			}),
		};
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
			title: `${msg.displayPrefix}${this.info.master ? `${this.info.master.info.name} ${info.name}` : info.name}`,
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
		if (info.examples && info.examples.length !== 0) {
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
					// This has a zero-width character in it
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

		if (this.info.aliases && this.info.aliases.length !== 0) {
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
				value: `${msg.displayPrefix}${info.name} ${info.usage || ''}`,
				inline: true,
			});
		}

		if (Object.keys(info.requirements.permissions.user).length !== 0) {
			// TODO: show bot requirements
			embed.fields.push({
				name: 'Permissions',
				value: `\`${Object.keys(info.requirements.permissions.user)
					.map(p => this.Atlas.util.format(msg.lang, `general.permissions.${p}`))
					.join('`, `')}\` (User)`,
				inline: true,
			});
		}

		embed.fields.forEach((f) => {
			f.name = f.name.replace(/@sylver/ig, msg.author.mention).replace(/@user/ig, msg.author.mention);
		});

		return embed;
	}
}

module.exports = Command;
