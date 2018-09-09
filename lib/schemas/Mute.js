const mongoose = require('mongoose');
const utils = require('./../utils');

const MuteSchema = new mongoose.Schema({
	// The user who recieved the infraction
	target: {
		type: String,
		required: true,
	},
	// The ID of the user who issued the infraction
	moderator: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
		required: true,
	},
	reason: {
		type: String,
	},
	startedTimestamp: {
		type: Date,
		default: Date.now,
	},
	duration: {
		type: Number,
		required: true,
	},
	role: {
		type: String,
		required: true,
		validate: {
			validator: id => utils.isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
});

module.exports = MuteSchema;
