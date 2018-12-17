const mongoose = require('mongoose');
const utils = require('../utils');

module.exports = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	cooldown: {
		type: Number,
		min: 2000,
		max: 300000,
		default: 2000,
	},
	delete: {
		type: Boolean,
		default: false,
	},
	dm: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	restrictions: {
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
		mode: {
			type: String,
			required: true,
			enum: ['blacklist', 'whitelist'],
			default: 'blacklist',
		},
	},
});
