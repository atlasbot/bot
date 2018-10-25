const mongoose = require('mongoose');
const utils = require('./../utils');

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
	// The actions cooldown in milliseconds
	cooldown: {
		type: Number,
		default: 0,
	},
	// Whether or not the action is silent
	silent: {
		type: Boolean,
		default: false,
	},
	banned: {
		roles: [{
			type: String,

			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
		channels: [{
			type: String,

			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
	},
	allowed: {
		roles: [{
			type: String,

			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
		channels: [{
			type: String,

			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
	},
	// How long the output should stay before being deleted
	ttl: {
		type: Number,
		default: null,
	},
});

module.exports = actionSchema;
