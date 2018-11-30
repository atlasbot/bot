const mongoose = require('mongoose');
const isSnowflake = require('../../lib/utils/isSnowflake');

const userGuildSettingsSchema = new mongoose.Schema({
	// the id of the guild
	id: {
		required: true,
		unique: true,
		type: String,
		validate: {
			validator: id => isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
	// tracked messages
	messages: {
		type: Number,
		default: 0,
	},
	// experience points
	xp: {
		type: Number,
		default: 0,
	},
	// permissions: {
	// 	allow: Number,
	// 	deny: Number,
	// },
	// roles: [String],
});

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
	guilds: [userGuildSettingsSchema],
});
