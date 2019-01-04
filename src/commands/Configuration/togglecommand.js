const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'togglecommand');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const query = args.join(' ');
		const command = this.Atlas.lib.utils.nbsFuzzy(this.Atlas.commands.labels, ['info.name'], query);

		if (!command) {
			return responder.error('noCommand', query).send();
		}

		const config = settings.command(command.info.name);

		if (config.existing) {
			await settings.update({
				'command_options.$.disabled': !config.disabled,
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
						disabled: !config.disabled,
					},
				},
			});
		}

		return responder.text((config.disabled ? 'enabled' : 'disabled'), command.info.name).send();
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
