const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	guild: {
		type: String,
		required: true,
	},
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
	reason: {
		type: String,
		required: true,
	},
	active: {
		type: Boolean,
		default: true,
	},
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});
