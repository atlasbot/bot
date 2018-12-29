const Command = require('../../structures/Command.js');

const restricted = {
	configuration: 'manageGuild',
};

const formatCommands = cmds => cmds.map(m => (m.info.subcommands.size !== 0 ? `\`${m.info.name}\`\\*` : `\`${m.info.name}\``)).join(', ');

module.exports = class Help extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			// they're after a full list of all the things
			const embed = {
				author: {
					name: 'help.title',
					icon_url: this.Atlas.client.avatarURL,
				},
				fields: [],
				description: ['help.description', msg.displayPrefix],
				timestamp: new Date(),
				footer: {
					text: responder.format('help.footer', this.Atlas.commands.labels.size),
				},
			};

			const entries = Array.from(this.Atlas.plugins.entries());

			if (settings) {
				if (!Object.values(settings.raw.plugins).some(p => p.state === 'enabled')) {
					return responder.embed({
						title: 'help.welcome.title',
						description: ['help.welcome.description', msg.displayPrefix],
						footer: {
							text: 'help.welcome.footer',
						},
					}).send();
				}

				const disabled = entries.filter(([, pl]) => {
					const conf = settings.plugin(pl.name);

					return conf && conf.state === 'disabled';
				});

				if (disabled.length) {
					embed.footer.text += responder.format(disabled.length === 1 ? 'help.disabled.singular' : 'help.disabled.plural', disabled.length);
				}
			}

			for (const [, plugin] of entries.filter(([, pl]) => {
				if (settings) {
					const pluginConf = settings.plugin(pl.name);
					const perm = restricted[pl.name.toLowerCase()];

					if (perm && !msg.channel.permissionsOf(msg.author.id).has(perm)) {
						return false;
					}

					if (pluginConf && pluginConf.state === 'disabled') {
						return false;
					}
				}

				return pl.commands.length;
			}).sort(([a], [b]) => (a.length > b.length ? 1 : -1))) {
				embed.fields.push({
					name: `${plugin.name} • ${plugin.commands.length}`,
					value: formatCommands(plugin.commands),
				});
			}

			if (settings) {
				const actions = await this.Atlas.DB.Action.find({
					guild: msg.guild.id,
					'trigger.type': 'label',
				});

				if (actions.length) {
					embed.fields.push({
						name: `Actions • ${actions.length}`,
						value: `\`${actions.map(a => msg.displayPrefix + a.trigger.content).join('`, `')}\``,
					});
				}
			}

			const sentMsg = await responder.embed(embed).dm(msg.author.id).send();

			if (sentMsg.channel.id !== msg.channel.id) {
				// it was probably dm'd
				return responder.text('help.sent').send();
			}

			return sentMsg;
		}

		// they're looking for a plugin or command

		const query = args[0].replace(/[\W_]+/g, '');
		const plugin = this.Atlas.lib.utils.nbsFuzzy(this.Atlas.plugins, ['name'], query);

		if (plugin) {
			let state;
			if (settings) {
				const conf = settings.plugin(plugin.name);

				if (conf) {
					({ state } = conf);
				}
			}

			return responder.embed({
				title: plugin.name,
				description: formatCommands(plugin.commands),
				footer: {
					text: state,
				},
				timestamp: new Date(),
			}).send();
		}

		const command = this.Atlas.lib.utils.nbsFuzzy(this.Atlas.commands.labels, ['info.name', 'info.aliases'], query);

		if (!command) {
			return responder.error('general.noResults', query).send();
		}

		if (command.info.subcommands && args[1]) {
			const sub = (new this.Atlas.lib.structs.Fuzzy(Array.from(command.info.subcommands.values()), {
				keys: ['info.name', 'info.aliases'],
			})).search(args[1].replace(/[\W_]+/g, ''));

			if (sub) {
				return responder
					.embed(sub.helpEmbed(msg))
					.send();
			}
		}

		return responder
			.embed(command.helpEmbed(msg))
			.send();
	}
};

module.exports.info = {
	name: 'help',
	examples: [
		'help',
		'Info',
		'ping',
		'whois',
		'remindme',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
