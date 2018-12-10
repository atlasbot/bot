const Command = require('../../structures/Command.js');

const opposites = {
	enabled: 'disabled',
	disabled: 'enabled',
};

module.exports = class TogglePlugin extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, null, 'toggleplugin');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const query = args.join(' ');
		const plugin = this.Atlas.lib.utils.nbsFuzzy(this.Atlas.plugins, ['name'], query);

		if (!plugin) {
			return responder.error('noPlugin', query).send();
		}

		const { state } = settings.plugin(plugin.name.toLowerCase());

		await settings.update({
			[`plugins.${plugin.name.toLowerCase()}.state`]: opposites[state],
		});

		return responder.text('success', plugin.name, opposites[state]).send();
	}
};

module.exports.info = {
	name: 'toggleplugin',
	// pre-v8 plugins were modules
	aliases: ['tp', 'tm', 'togglemodule'],
	permissions: {
		user: {
			manageGuild: true,
		},
	},
};
