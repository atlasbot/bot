const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
	// Actions that are apart of the custom action
	actions: [{
		type: {
			type: String,
			enum: ['respond'],
		},
		message: {
			type: String,
			required: true,
			maxLength: 2048,
		},
	}],
	trigger: {
		// label is basically a command, e.g if it were called "help" and this was set to label, you would run it via "a!help"
		// that's the theory atleast
		type: {
			type: String,
			enum: ['label', 'keyword'],
		},
		content: {
			type: String,
			required: true,
			lowercase: true,
		},
	},
	// Whether or not it's enabled
	enabled: {
		type: Boolean,
		default: true,
	},
	// The action's description
	description: {
		type: String,
		default: 'A very mysterious action',
	},
	// The actions cooldown
	cooldown: {
		type: Number,
		default: 0,
	},
	// Whether or not the action is silent
	silent: {
		type: Boolean,
		default: false,
	},
	// Roles that will not trigger/cannot use this action
	banned_roles: [{
		type: String,
	}],
	// Channels that will not trigger/cannot use this action
	banned_channels: [{
		type: String,
	}],
	// Roles that can trigger this action, if defined then all other roles are automatically blacklisted
	allowed_roles: [{
		type: String,
	}],
	// How long the output should stay before being deleted
	ttl: {
		type: Number,
		default: null,
	},
});

module.exports = actionSchema;
