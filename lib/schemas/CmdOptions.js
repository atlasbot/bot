const mongoose = require('mongoose');
const utils = require('./../utils');

module.exports = new mongoose.Schema({
	label: {
		type: String,
		required: true,
	},
	cooldown: {
		type: Number,
		min: 2000,
		max: 300000,
		default: 2000,
	},
	auto_delete: {
		type: Boolean,
		default: false,
	},
	silent: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	blacklist: {
		channels: [{
			type: String,
			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
		roles: [{
			type: String,
			validate: {
				validator: id => utils.isSnowflake(id),
				message: '{VALUE} is not a valid snowflake!',
			},
		}],
	},
});
