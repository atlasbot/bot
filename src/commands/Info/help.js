const Command = require('../../structures/Command.js');

module.exports = class Help extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			const embed = {
				author: {
					name: 'help.title',
					icon_url: this.Atlas.client.avatarURL,
				},
				fields: [],
				description: ['help.description', msg.displayPrefix],
				timestamp: new Date(),
				footer: {
					text: `${this.Atlas.commands.labels.size} commands`,
				},
			};

			const entries = Array.from(this.Atlas.plugins.entries());

			// idk about this fo sho but i think it looks kinda nice
			entries.sort(([a], [b]) => (a.length > b.length ? 1 : -1));

			for (const [, plugin] of entries.filter(([, pl]) => pl.commands.length)) {
				embed.fields.push({
					name: `${plugin.name} • ${plugin.commands.length}`,
					value: plugin.commands.map(m => (m.info.subcommands.size !== 0 ? `\`${m.info.name}\`\\*` : `\`${m.info.name}\``)).join(', '),
				});
			}

			return responder.embed(embed).send();
		}

		const query = args[0].replace(/[\W_]+/g, '');

		const cmds = Array.from(this.Atlas.commands.labels.values()).filter(c => !c.info.hidden);
		const command = (new this.Atlas.lib.structs.Fuzzy(cmds, {
			keys: ['info.name', 'info.aliases'],
		})).search(query);

		if (command) {
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

		return responder.error('general.noResults', query).send();
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
