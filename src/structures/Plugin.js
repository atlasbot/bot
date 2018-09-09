class Plugin {
	constructor(data) {
		/** The plugins description */
		this.name = data.name;
		/** The plugins description */
		this.description = data.description;
		/** The plugins icon (path) */
		this.icon = data.icon;
		/** The plugins directory */
		this.dir = data.dir;
		this.raw = data;
		this._Atlas = require('./../../Atlas');
	}

	/**
     * The commands this plugin has
     */
	get commands() {
		return Array.from(this._Atlas.commands.labels.values()).filter(m => m.info.plugin.name === this.name);
	}
}
module.exports = Plugin;
