const mongoose = require('mongoose');
const infractionSchema = require('./Infraction');

const userSchema = new mongoose.Schema({
	// The ID of the user
	id: {
		type: String,
		index: true,
		required: true,
		unique: true,
	},
	// Per-guild data for the user
	guilds: [{
		// The ID of the guild
		id: {
			type: String,
			unique: true,
			required: true,
		},
		// The amount of XP the user has in said guild
		xp: {
			type: Number,
			default: 0,
		},
		// The balance (amount of gems) the user has in said guild
		balance: {
			type: Number,
			default: 0,
		},
		lastDaily: {
			type: Date,
			default: null,
		},
	}],
	// A list of all ID's for every infraction the user has recieved
	infractions: [infractionSchema],
	// Powerups, mainly for gem packs that can be redeemed in servers.
	powerups: [{
		// The type of powerup
		type: {
			type: Number,
			required: true,
		},
		// When the powerup was redeemed
		redeemed: {
			type: Date,
			default: null,
		},
	}],
	// The users social profile
	profile: {
		// A list of integrations
		integrations: [{
			// The name of the integration, e.g "Twitter"
			name: {
				type: String,
				required: true,
			},
			// The value of the field, e.g "@NotSylver"
			value: {
				type: String,
				required: true,
			},
		}],
		// The profile description, provided by the user
		description: {
			type: String,
			default: 'I am a very mysterious person.',
		},
		// The profile's color
		color: {
			type: Number,
			default: null,
		},
	},
});

userSchema.statics.findOneOrCreate = async function findOneOrCreate(id) {
	const self = this;
	const data = await self.findOne(id);
	if (!data) {
		return self.create(id);
	}

	return data;
};

module.exports = userSchema;
