const mongoose = require('mongoose');

const discordId = require('../mongoSnowflake');

module.exports = new mongoose.Schema({
	level: {
		type: Number,
		maxlength: 150,
		minlength: 0,
		required: true,
	},
	type: {
		type: String,
		required: true,
		enum: ['role'],
	},
	content: discordId,
});
