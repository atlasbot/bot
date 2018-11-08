const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	subject: {
		type: String,
	},
	suffix: {
		type: String,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	author: {
		type: String,
	},
	channel: {
		type: String,
	},
});
