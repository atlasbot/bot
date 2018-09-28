const Command = require('../../structures/Command.js');

// todo: exclude disabled commands/modules, maybe hide commands the user doesn't have perms for too

module.exports = class Help extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			const embed = {
				author: {
					name: 'help.title',
					icon_url: this.Atlas.client.avatarURL || this.Atlas.client.defaultAvatarURL,
				},
				fields: [],
				description: ['help.description', msg.displayPrefix],
				timestamp: new Date(),
				footer: {
					text: `${this.Atlas.commands.labels.size} commands`,
				},
			};
			for (const modName of this.Atlas.plugins.keys()) {
				const plugin = this.Atlas.plugins.get(modName);
				embed.fields.push({
					name: plugin.name,
					value: `\`${plugin.commands.map(m => m.info.name).join('`, `')}\``,
				});
			}

			return responder.embed(embed).send();
		}
		const query = args[0].replace(/[\W_]+/g, '');

		const cmds = Array.from(this.Atlas.commands.labels.values()).filter(c => !c.info.hidden);
		const command = (new this.Atlas.structs.Fuzzy(cmds, {
			keys: ['info.name', 'info.aliases'],
		})).search(query);

		if (command) {
			if (command.info.subcommands && args[1]) {
				const sub = (new this.Atlas.structs.Fuzzy(Array.from(command.info.subcommands.values()), {
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
		'Misc',
		'ping',
		'whois',
		'remindme',
	],
};
