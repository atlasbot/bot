module.exports = class Plugin {
	constructor({
		directory,
		commands,
		name,
	}) {
		this.name = name;
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
};
