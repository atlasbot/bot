const _path = require('path');
const fs = require('fs').promises;

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

				const files = (await fs.readdir(_path.join(__dirname, path)))
					.map(f => _path.parse(f));

				// loading bases/subs
				const bases = files.filter(p => !p.ext);
				if (bases.length !== 0) {
					for (const base of bases) {
						const files = await fs.readdir(_path.join(__dirname, path, base.base));
						plugin.subcommands.push({
							base: _path.join(__dirname, path, base.base, 'index.js'),
							subs: files.filter(f => f !== 'index.js')
								.map(f => _path.join(__dirname, path, base.base, f)),
						});
					}
				}
				// loading regular commands
				const cmds = files.filter(p => p.ext === '.js');
				if (cmds.length !== 0) {
					for (const cmd of cmds) {
						plugin.commands.push(_path.join(__dirname, path, cmd.base));
					}
				} else {
					console.warn(`The ${plugin.name} plugin has no commands - why even have it?`);
				}

				plugins.push(plugin);
			}
		}

		return plugins;
	}

	static async load(Atlas) {
		const plugins = await this.plugins();
		for (const plugin of plugins) {
			Atlas.plugins.set(plugin.name, plugin);
			plugin.commands.forEach(cmd => this.setup(Atlas, cmd, {
				plugin,
			}));
			plugin.subcommands.forEach(sub => this.setup(Atlas, sub.base, {
				subs: sub.subs,
				plugin,
			}));
		}
	}

	static setup(Atlas, path, {
		reload = false,
		subs,
		master,
		plugin,
	} = {}) {
		const Prop = require(path);
		let prop;
		try {
			prop = new Prop(Atlas);
		} catch (e) {
			return;
		}
		prop.info.subcommands = new Map();
		if (master) {
			prop.info.master = master;
		} else if (subs) {
			subs.forEach(sub => this.setup(Atlas, sub, {
				master: prop,
				plugin,
			}));
		}
		prop.info.workdir = path;
		prop.info.plugin = plugin;
		// TODO: subcommand alias support
		prop.info.aliases.forEach((alias) => {
			if (!master && !reload && Atlas.commands.labels.has(alias)) {
				console.warn(`(WARN) Alias "${alias}" already is registered by ${Atlas.commands.get(alias).info.name}! Overriding - (${path})`);
			}
			Atlas.commands.aliases.set(alias, prop.info.name);
		});
		if (master && !reload && Atlas.commands.labels.has(prop.info.name)) {
			console.warn(`(WARN) Name ${prop.info.name} is already registered by ${Atlas.commands.get(prop.info.name).info.name}`);
		}
		if (prop.constructor.name.toLowerCase() !== prop.info.name) {
			console.warn(`(STYLE) Class name for "${prop.info.name}" should match the command name.`);
		}
		if (prop.info.usage && prop.info.noExamples) {
			console.warn(`(STYLE) Command "${prop.info.name}" has usage without any examples!`);
		}
		if (master) {
			master.info.subcommands.set(prop.info.name, prop);
		} else {
			Atlas.commands.labels.set(prop.info.name, prop);
		}
		// fs.readFile(path, 'utf-8')
		// 	.then((file) => {
		// 		// temporary tests to make sure nothing gets fucky until release (maybe)
		// 		// this is my first attempt at regex, be gentle
		// 		const re1 = /^(?!console).+(?:error|text)\([\\]?[\\]?'([A-z0-9.]+)[\\]?[\\]?'/gm;
		// 		const re2 = /(?:name|value): \[?[\\]?[\\]?'(.*?)[\\]?[\\]?'/gm;
		// 		let result;
		// 		while ((result = re1.exec(file) || re2.exec(file))) { // eslint-disable-line no-cond-assign
		// 			if (result[1].includes('.')) {
		// 				const key = Atlas.lib.utils.key(result[1]); // eslint-disable-line prefer-destructuring
		// 				if (!Atlas.lib.utils.getNested(Atlas.langs.get('en-US'), key)) {
		// 					console.warn(`(LOCALE) No key exists matching "${key}" (${prop.info.name})`);
		// 				}
		// 			}
		// 		}
		// 	});
		delete require.cache[require.resolve(path)];

		return prop;
	}
};
