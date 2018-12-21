const mongoose = require('mongoose');
const isSnowflake = require('../../lib/utils/isSnowflake');

const guildSettingsSchema = new mongoose.Schema({
	// the id of the guild
	id: {
		required: true,
		type: String,
		validate: {
			validator: id => isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
	// tracked messages
	messages: {
		type: Number,
		default: 0,
	},
	// experience points
	xp: {
		type: Number,
		default: 0,
	},
});

module.exports = new mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	discriminator: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	guilds: [guildSettingsSchema],
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

module.exports.index({
	id: 1,
});
