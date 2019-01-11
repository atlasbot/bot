const mongoose = require('mongoose');

const Settings = require('./Settings');

/* eslint-disable func-names */

module.exports = class Database {
	constructor() {
		const SettingsSchema = require('atlas-lib/lib/models/Settings');
		const ActionSchema = require('atlas-lib/lib/models/Action');
		const InfractionSchema = require('atlas-lib/lib/models/Infraction');
		const PlaylistSchema = require('atlas-lib/lib/models/Playlist');
		const UserSchema = require('atlas-lib/lib/models/User');

		this.Settings = mongoose.model('Settings', SettingsSchema);
		this.Action = mongoose.model('Action', ActionSchema);
		this.Infraction = mongoose.model('Infraction', InfractionSchema);
		this.Playlist = mongoose.model('Playlist', PlaylistSchema);
		this.User = mongoose.model('User', UserSchema);

		mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
		});
	}

	async settings(guild) {
		let settings = await this.Settings.findOne({ id: guild.id || guild });

		if (!settings) {
			const data = typeof guild === 'string' ? { id: guild } : guild;

			settings = await this.Settings.create(data);
		}

		return new Settings(settings);
	}

	async user(user) {
		let profile = await this.User.findOne({ id: user.id || user });

		if (!profile) {
			const data = typeof user === 'string' ? { id: user } : user;

			profile = await this.User.create(data);
		}

		return profile;
	}
};
