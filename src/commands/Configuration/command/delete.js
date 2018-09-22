const Command = require('../../../structures/Command.js');

module.exports = class Delete extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, [query], { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!query) {
			return responder.error('command.create.noQuery').send();
		}

		const actions = settings.plugin('actions').actions
			.filter(a => a.trigger.type === 'label');

		const cmd = actions.find(c => c.trigger.content === query.toLowerCase());

		if (!cmd) {
			return responder.error('command.delete.noMatch', query.toLowerCase()).send();
		}

		await settings.update({
			$pull: {
				'plugins.actions.actions': {
					_id: cmd._id,
				},
			},
		});

		return responder.text('command.delete.success', cmd.trigger.content).send();
	}
};

module.exports.info = {
	name: 'delete',
	description: 'info.command.delete.description',
	usage: 'info.command.delete.usage',
	guildOnly: true,
	examples: [
		'my_command',
	],
	aliases: [
		'rm',
		'remove',
		'del',
	],
};
