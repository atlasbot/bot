const Command = require('../../../structures/Command.js');


module.exports = class Create extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
		parsedArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('command.create.noName').send();
		}

		const name = args.shift().toLowerCase();
		const response = args.join(' ');

		if (name === 'command') {
			return responder.error('command.create.reservedName').send();
		}

		if (!response) {
			return responder.error('command.create.noResponse').send();
		}

		const existing = settings.plugin('actions').actions
			.filter(a => a.trigger.type === 'label')
			.find(a => a.trigger.content === name);

		if (existing) {
			return responder.error('command.create.alreadyExists', existing.trigger.content).send();
		}

		await settings.update({
			$push: {
				'plugins.actions.actions': {
					actions: [{
						type: 'respond',
						message: response,
					}],
					trigger: {
						type: 'label',
						content: name,
					},
					description: parsedArgs.description,
				},
			},
		});

		return responder.text('command.create.success', name).send();
	}
};

module.exports.info = {
	name: 'create',
	description: 'info.command.create.description',
	usage: 'info.command.create.usage',
	guildOnly: true,
	examples: [
		'my_command Wew it works :^)',
		'lenny ( ͡° ͜ʖ ͡°)',
		'help Here is some help for my server that will override the default help command ( ͡°Ɛ ͡°)',
	],
	aliases: [
		'new',
	],
	supportedFlags: [{
		name: 'description',
		description: 'The command\'s description. You should include basic information about what it does here.',
	}],
	requirements: {
		permissions: {
			user: {
				manageGuild: true,
			},
		},
	},
};
