const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	channelID: {
		type: String,
		required: true,
	},
	messageID: {
		type: String,
		required: true,
	},
	denied: {
		by: {
			type: String,
		},
		reason: {
			type: String,
		},
	},
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

module.exports = suggestionSchema;
