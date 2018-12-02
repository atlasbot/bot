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
			subcommands: new Map(),
			subcommandAliases: new Map(),
		},
		...info };

		this.execute = this.execute.bind(this);
		this.action = this.action.bind(this);
	}

	async execute(msg, args, {
		settings,
		parsedArgs = {},
		...passthrough
	}) {
		const responder = new Responder(msg);

		if (settings) {
			for (const permsKey of Object.keys(this.info.permissions || {})) {
				const permissions = Object.keys(this.info.permissions[permsKey]);
				for (const perm of permissions) {
					const perms = msg.channel.permissionsOf((permsKey === 'bot' ? msg.guild.me : msg.member).id);
					if (perms.has(perm) === false) {
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
		}

		if ((this.info.guildOnly === true || this.info.premiumOnly) && !msg.guild) {
			return responder.error('general.guildOnly').send();
		}

		if (this.info.premiumOnly) {
			const patron = await this.Atlas.lib.utils.isPatron(msg.guild.ownerID);

			if (!patron || patron.amount_cents < 500) {
				return responder.error('general.premiumOnly').send();
			}
		}

		if (this.info.patronOnly) {
			const patron = !!await this.Atlas.lib.utils.isPatron(msg.author.id);

			if (!patron) {
				return responder.error('general.patronOnly', msg.prefix).send();
			}
		}

		try {
			await this.action(msg, args, {
				settings,
				parsedArgs,
				...passthrough,
				get cleanArgs() {
					return cleanArgs(msg, args);
				},
			});

			const duration = new Date() - new Date(msg.createdAt);

			if (process.env.VERBOSE === 'true') {
				console.log(`${this.info.name} - ${msg.author.username} ${msg.author.id} ${duration}ms`);
			}
		} catch (e) {
			console.error(e);

			if (e.status && e.response) {
				// it's /probably/ a superagent error
				responder.error('general.restError').send();
			} else {
				responder.error('general.errorExecuting').send();
			}

			throw e;
		}
	}

	/**
	 * Converts the command info to a language
	 * @param {string} lang The locale to format with, defaults to "DEFAULT_LANG"
	 * @returns {Object} the converted command info
	 */
	getInfo(lang = process.env.DEFAULT_LANG) {
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

		if (this.info.examples && this.info.examples.length) {
			if (this.info.examples.length > 5) {
				let col1;
				if (this.info.master) {
					col1 = this.info.examples.map(e => `${msg.displayPrefix + this.info.master.info.name} ${this.info.name} ${e}`);
				} else {
					col1 = this.info.examples.map(e => `${msg.displayPrefix + this.info.name} ${e}`);
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
					value: `${msg.displayPrefix + this.info.master.info.name} ${this.info.name} ${this.info.examples
						.join(`\n${msg.displayPrefix + this.info.master.info.name} ${this.info.name} `)}`,
				});
			} else {
				embed.fields.push({
					name: 'Examples',
					value: `${msg.displayPrefix + this.info.name} ${this.info.examples.join(`\n${msg.displayPrefix + this.info.name} `)}`,
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
				value: `${msg.displayPrefix}${this.info.master.info.name} ${this.info.name} ${info.usage || ''}`,
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
				name: 'User Permissions',
				value: `\`${Object.keys(this.info.permissions.user)
					.map(p => this.Atlas.util.format(msg.lang, `general.permissions.list.${p}`))
					.join('`, `')}\``,
				inline: true,
			});
		}

		if (this.info.permissions.bot && Object.keys(this.info.permissions.bot).length) {
			embed.fields.push({
				name: 'Bot Permissions',
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
			// using random names doesn't work anymore because discord won't resolve id's in embeds :c
			f.value = f.value.replace(/(@sylver|@random|@user)/ig, msg.author.mention);

			if (msg.guild) {
				// names without numbers look better in embeds, also wipes out tickets because they include the users discrim
				const options = [...msg.guild.channels.values()].filter(c => c.type === 0 && !/[0-9]/.exec(c.name) && c.permissionsOf(msg.author.id).has('readMessages'));

				if (options.length) {
					f.value = f.value
						.replace(/#([A-z-]+)/ig, (ignore, match1) => {
							const channel = msg.guild.channels.find(c => c.name === match1);

							if (channel) {
								return channel.mention;
							}

							const option = this.Atlas.lib.utils.pickOne(options);

							return option.mention;
						});
				}
			}
		});

		return embed;
	}
}

module.exports = Command;
