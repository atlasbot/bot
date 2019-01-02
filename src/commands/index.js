const _path = require('path');
const fs = require('fs');

const walkSync = require('../../lib/utils/walkSync');
const Plugin = require('./../structures/Plugin');

module.exports = class Commands {
	/**
	 * Loads commands and plugins.
	 * @param {boolean} require Whether to require() each command or just return the file.
	 * @returns {Object} The loaded data with plugins and commands
	 */
	static load(require = false) {
		const plugins = [];
		let commands = [];

		const pluginNames = fs.readdirSync(__dirname).filter(c => !_path.parse(c).ext);

		for (const folder of pluginNames) {
			const pluginDir = _path.join(__dirname, folder);
			const pluginCommands = walkSync(pluginDir);

			plugins.push({
				directory: pluginDir,
				commands: pluginCommands,
			});
		}

		if (require) {
			commands = commands.map(c => require(c));
		}

		return {
			plugins,
			commands,
		};
	}

	static setup(Atlas) {
		const { plugins: rawPlugins } = this.load();

		const subs = [];

		for (const { directory, commands } of rawPlugins) {
			const plugin = new Plugin(directory, commands);

			for (const loc of plugin.commandFiles) {
				const fileName = _path.basename(loc);
				const parent = _path.basename(_path.dirname(loc));

				const isSub = plugin.name !== parent && fileName !== 'index.js';

				const Command = require(loc);
				const command = new Command(Atlas, plugin);

				command.plugin = plugin;
				command.location = loc;
				command.isSub = isSub;

				if (!isSub) {
					// subcommands are registered on their parent
					Atlas.commands.labels.set(command.info.name, command);

					command.info.aliases.forEach((a) => {
						Atlas.commands.aliases.set(a, command);
					});
				} else {
					command.parent = parent;

					subs.push(command);
				}

				delete require.cache[require.resolve(loc)];
			}

			Atlas.plugins.set(plugin.name, plugin);
		}

		for (const sub of subs) {
			const parent = Atlas.commands.get(sub.parent);

			parent.subcommands.set(sub.info.name, sub);

			sub.info.aliases.forEach((a) => {
				parent.subcommandAliases.set(a, sub);
			});
		}
	}
};
