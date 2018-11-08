const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	// required to display usernames/avatars on the dashboard (leaderboards, etc...) without spamming discord with user lookups
	// this is already public information that anyone can get if they have your user ID, but looking up 100+ users individually is infeasible
	id: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	discriminator: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
});
