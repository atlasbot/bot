const _path = require('path');
const fs = require('fs').promises;
const Plugin = require('./../structures/Plugin');

module.exports = class Commands {
	static async plugins() {
		const plugins = [];
		const files = await fs.readdir(__dirname);
		for (const path of files) {
			const file = _path.parse(path);
			if (!file.ext) {
				// it's /probably/ a directory, so lets try and load it as a plugin
				const plugin = require(_path.join(__dirname, path, 'plugin.json'));
				if (!plugin) {
					throw new Error(`No plugin info file for ${path}`);
				}
				if (!plugin.commands) {
					plugin.commands = [];
				}
				if (!plugin.subcommands) {
					plugin.subcommands = [];
				}

				const pluginCmds = (await fs.readdir(_path.join(__dirname, path)))
					.map(f => _path.parse(f));

				// loading bases/subs
				const bases = pluginCmds.filter(p => !p.ext);
				if (bases.length) {
					for (const base of bases) {
						const cmdfiles = await fs.readdir(_path.join(__dirname, path, base.base));
						plugin.subcommands.push({
							base: _path.join(__dirname, path, base.base, 'index.js'),
							subs: cmdfiles.filter(f => f !== 'index.js')
								.map(f => _path.join(__dirname, path, base.base, f)),
						});
					}
				}
				// loading regular commands
				const cmds = pluginCmds.filter(p => p.ext === '.js');
				if (cmds.length) {
					for (const cmd of cmds) {
						plugin.commands.push(_path.join(__dirname, path, cmd.base));
					}
				}

				plugins.push(plugin);
			}
		}

		return plugins;
	}

	static async load(Atlas) {
		const plugins = await this.plugins();
		for (const plugin of plugins) {
			Atlas.plugins.set(plugin.name.toLowerCase(), new Plugin(plugin));

			plugin.commands.forEach(cmd => this.setup(Atlas, cmd, {
				plugin,
			}));

			plugin.subcommands.forEach(sub => this.setup(Atlas, sub.base, {
				subs: sub.subs,
				plugin,
			}));

			console.log(`Loaded plugin: "${plugin.name}"`);
		}

		console.log(`Loaded ${plugins.length} plugins`);

		console.log(`Loaded ${plugins.map(p => p.commands.length).reduce((a, b) => a + b, 0)} commands`);
		console.log(`Loaded ${plugins.map(p => p.subcommands.length).reduce((a, b) => a + b, 0)} subcommands`);
	}

	static setup(Atlas, path, {
		subs,
		master,
		plugin,
	} = {}) {
		const warnings = [];

		const Prop = require(path);
		if (!Prop.info) {
			return;
		}

		let prop;
		try {
			prop = new Prop(Atlas);
		} catch (e) {
			console.error(`Error loading ${Prop.info.name}`, e);

			return;
		}

		prop.info.subcommands = new Map();
		prop.info.subcommandAliases = new Map();

		if (master) {
			prop.info.master = master;
		} else if (subs) {
			subs.forEach(sub => this.setup(Atlas, sub, {
				master: prop,
				plugin,
			}));
		}

		// the location is basically where the command file is
		prop.info.location = path;
		prop.info.relative = _path.relative(process.cwd(), path);
		// the plugin the command is from
		prop.info.plugin = plugin;

		prop.info.aliases.forEach((alias) => {
			if (master) {
				master.info.subcommandAliases.set(alias, prop.info.name);
			} else {
				Atlas.commands.aliases.set(alias, prop.info.name);
			}
		});

		if (master && Atlas.commands.labels.has(prop.info.name)) {
			warnings.push(`Name ${prop.info.relative} is already registered by ${Atlas.commands.get(prop.info.name).info.relative}`);
		}

		// more or less enforce examples for most commands
		if (prop.info.usage && prop.info.noExamples) {
			warnings.push(`Command "${prop.info.relative}" has usage without any examples!`);
		}

		// registering the command
		if (master) {
			master.info.subcommands.set(prop.info.name, prop);
		} else {
			Atlas.commands.labels.set(prop.info.name, prop);
		}

		if (prop.info.ignoreStyleRules !== true) {
			warnings.map(w => console.warn(w));
		}

		delete require.cache[require.resolve(path)];

		return prop;
	}
};
