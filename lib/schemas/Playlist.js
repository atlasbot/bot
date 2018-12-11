const mongoose = require('mongoose');
const isSnowflake = require('./../utils/isSnowflake');

module.exports = new mongoose.Schema({
	author: {
		type: String,
		required: true,
		validate: {
			validator: id => isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
	name: {
		type: String,
		required: true,
	},
	tracks: [{
		track: {
			type: String,
			required: true,
		},
		info: {
			identifier: {
				type: String,
				required: true,
			},
			isSeekable: {
				type: Boolean,
				required: true,
			},
			author: {
				type: String,
				required: true,
			},
			length: {
				type: Number,
				required: true,
			},
			title: {
				type: String,
				required: true,
			},
			uri: {
				type: String,
				required: true,
			},
		},
	}],
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});
