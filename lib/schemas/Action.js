const mongoose = require('mongoose');
const utils = require('./../utils');

const actionSchema = new mongoose.Schema({
	// things to do when the action is executed
	actions: [{
		type: {
			type: String,
			enum: ['channel', 'dm'],
		},
		message: {
			type: String,
			required: true,
			maxLength: 2048,
		},
		// if null, assumes the invocation channel. only used if "type" === "channel"
		channel: {
			type: String,

			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
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
	flags: {
	// How long the output should stay before being deleted
		ttl: {
			type: Number,
			default: null,
		},
		// The actions cooldown in milliseconds between uses/triggers
		cooldown: {
			type: Number,
			default: 0,
		},
		// Whether or not it's enabled
		enabled: {
			type: Boolean,
			default: true,
		},
		// Whether or not the action is silent
		silent: {
			type: Boolean,
			default: false,
		},
		// if true, the invocation message will be deleted.
		delete: {
			type: Boolean,
			default: false,
		},
		// whether to hide permission related messages (e.g, if a user doesn't have a required role to run the action, atlas won't tell them to piss off, it'll just to nothing)
		quiet: {
			type: Boolean,
			default: false,
		},
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
});

module.exports = actionSchema;
