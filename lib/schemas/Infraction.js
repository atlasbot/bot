const mongoose = require('mongoose');

const infractionSchema = new mongoose.Schema({
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
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	active: {
		type: Boolean,
		default: true,
	},
});

module.exports = infractionSchema;
