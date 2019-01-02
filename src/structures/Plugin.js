const path = require('path');

class Plugin {
	constructor(directory, commands) {
		this.name = path.basename(directory);
		this.dir = directory;

		this.commandFiles = commands;

		this.Atlas = require('./../../Atlas');
	}

	/**
     * The commands this plugin has
     */
	get commands() {
		return Array.from(this.Atlas.commands.labels.values()).filter(m => m.plugin.name === this.name);
	}
}
module.exports = Plugin;
