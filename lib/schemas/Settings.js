const mongoose = require('mongoose');
const utils = require('../utils');

const commandOptionsSchema = require('./CommandOption');
// const suggestionSchema = require('./Suggestion');
const muteSchema = require('./Mute');

const levelRewardSchema = new mongoose.Schema({
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
	content: {
		type: String,
		validate: {
			validator: id => utils.isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
});

const pluginDefaults = {
	state: {
		type: String,
		enum: ['disabled', 'enabled'],
		default: 'disabled',
	},
	restrictions: {
		mode: {
			type: String,
			enum: ['blacklist', 'whitelist'],
			default: 'blacklist',
		},
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
};

const filterDefaults = {
	action_type: {
		type: Number,
		default: 0,
	},
	exempt_channels: [{
		type: String,

		validate: {
			validator: id => utils.isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	}],
	exempt_roles: [{
		type: String,

		validate: {
			validator: id => utils.isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	}],
	sanction_bots: {
		type: Boolean,
		default: false,
	},
	sanction_moderators: {
		type: Boolean,
		default: false,
	},
};

const guildSchema = new mongoose.Schema({
	id: {
		type: String,
		unique: true,
		required: true,
		validate: {
			validator: id => utils.isSnowflake(id),
			message: '{VALUE} is not a valid snowflake!',
		},
	},
	prefix: {
		type: String,
		default: process.env.DEFAULT_PREFIX,
	},
	lang: {
		type: String,
	},
	command_options: [commandOptionsSchema],
	plugins: {
		info: {
			...pluginDefaults,
		},
		levels: {
			...pluginDefaults,
			options: {
				rewards: [levelRewardSchema],
				stack: {
					type: Boolean,
					default: false,
				},
				notify: {
					enabled: {
						type: Boolean,
						default: true,
					},
					content: {
						type: String,
						default: 'Congratulations {user.mention}! You just advanced to **level {user.level}**!',
					},
					dm: {
						type: Boolean,
						default: false,
					},
				},
			},
		},
		music: {
			...pluginDefaults,
			options: {
				small_msgs: {
					type: Boolean,
					default: false,
				},
				show_results: {
					type: Boolean,
					default: false,
				},
				hide_nowplaying: {
					type: Boolean,
					default: false,
				},
				player_buttons: {
					type: Boolean,
					default: true,
				},
			},
		},
		fun: {
			...pluginDefaults,
		},
		moderation: {
			...pluginDefaults,
			logs: {
				mod: {
					type: String,
					default: null,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
				action: {
					type: String,
					default: null,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
				error: {
					type: String,
					default: null,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
			},
			warn_on_mute: {
				type: Boolean,
				default: true,
			},
			mute_role: {
				type: String,
				default: null,
				validate: {
					validator: id => (id ? utils.isSnowflake(id) : true),
					message: '{VALUE} is not a valid snowflake!',
				},
			},
			mutes: [muteSchema],
			filters: {
				// Chat filters
				phrases: {
					...filterDefaults,
					list: [{
						type: String,
						trim: true,
						lowercase: true,
					}],
				},
				// Chat filters
				cursing: {
					...filterDefaults,
					sexual: {
						type: Boolean,
						default: true,
					},
					insult: {
						type: Boolean,
						default: true,
					},
					discriminatory: {
						type: Boolean,
						default: true,
					},
				},
				// Excessive caps
				capitalization: {
					...filterDefaults,
					threshold: {
						type: Number,
						default: 75,
					},
				},
				// Excessive eomjis
				emoji: {
					...filterDefaults,
					threshold: {
						type: Number,
						default: 5,
					},
				},
				// Links
				links: {
					...filterDefaults,
					exclusions: {
						type: Array,
						default: [
							'atlasbot.xyz',
							'discordapp.com',
							'discord.gg',
						],
					},
				},
				invites: {
					...filterDefaults,
				},
				mentions: {
					...filterDefaults,
					threshold: {
						type: Number,
						default: 5,
					},
				},
				spam: {
					...filterDefaults,
					threshold: {
						type: Number,
						default: 5,
					},
					time: {
						type: Number,
						default: 4000,
					},
				},
			},
		},
		gatekeeper: {
			...pluginDefaults,
			dm: {
				enabled: {
					type: Boolean,
					default: false,
				},
				content: {
					type: String,
					default: 'Welcome to {guild.name} {user.mention}! Make sure to follow the rules and be respectful of other members.',
				},
			},
			channel: {
				enabled: {
					type: Boolean,
					default: false,
				},
				channel: {
					type: String,
				},
				content: {
					type: String,
					default: '{user.mention} has joined {guild.name}. Make sure to give them a warm welcome!',
				},
			},
			leave: {
				enabled: {
					type: Boolean,
					default: false,
				},
				channel: {
					type: String,
				},
				content: {
					type: String,
					default: '{user.mention} has left {guild.name} :c.',
				},
			},
		},
		utilities: {
			...pluginDefaults,
		},
	},
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

module.exports = guildSchema;
