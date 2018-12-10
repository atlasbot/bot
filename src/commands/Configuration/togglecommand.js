const Command = require('../../structures/Command.js');

module.exports = class ToggleCommand extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, null, 'togglecommand');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const query = args.join(' ');
		let command = this.Atlas.lib.utils.nbsFuzzy(this.Atlas.commands.labels, ['info.name'], query);

		if (!command) {
			// look for an alias
			command = this.Atlas.commands.get(this.Atlas.lib.utils.nbsFuzzy(this.Atlas.commands.aliases, [], query));
		}

		if (!command) {
			return responder.error('noCommand', query).send();
		}

		const config = settings.raw.command_options.find(c => c.name === command.info.name);
		const disabled = config ? config.disabled : false;

		if (config) {
			await settings.update({
				'command_options.$.disabled': !disabled,
			}, {
				query: {
					'command_options.name': command.info.name,
				},
			});
		} else {
			await settings.update({
				$push: {
					command_options: {
						name: command.info.name,
						disabled: !disabled,
					},
				},
			});
		}

		return responder.text((disabled ? 'disabled' : 'enabled'), command.info.name).send();
	}
};

module.exports.info = {
	name: 'togglecommand',
	// pre-v8 plugins were modules
	aliases: ['tc'],
	permissions: {
		user: {
			manageGuild: true,
		},
	},
	guildOnly: true,
};
