const mongoose = require('mongoose');
const utils = require('./../utils');

const commandOptioNSchema = require('./CommandOption');
// const suggestionSchema = require('./Suggestion');
const muteSchema = require('./Mute');

// todo: camel case keys

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
	command_options: [commandOptioNSchema],
	plugins: {
		roles: {
			...pluginDefaults,
			reaction_roles: [{
				role: {
					type: String,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
				emoji: {
					name: {
						type: String,
						required: true,
					},
					id: {
						type: String,
						validate: {
							validator: id => utils.isSnowflake(id),
							message: '{VALUE} is not a valid snowflake!',
						},
					},
				},
				message: {
					type: String,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
			}],
			auto_role: [{
				type: String,
				validate: {
					validator: id => utils.isSnowflake(id),
					message: '{VALUE} is not a valid snowflake!',
				},
			}],
		},
		// suggestions: {
		// 	state: {
		// 		type: String,
		// 		enum: ['disabled', 'enabled'],
		// 		default: 'disabled',
		// 	},
		// 	blacklist: {
		// 		mode: {
		// 			type: String,
		// 			enum: ['blacklist', 'whitelist'],
		// 		},
		// 		roles: [{
		// 			type: String,
		// 			validate: {
		// 				validator: id => utils.isSnowflake(id),
		// 				message: '{VALUE} is not a valid snowflake!',
		// 			},
		// 		}],
		// 		channels: [{
		// 			type: String,

		// 			validate: {
		// 				validator: id => utils.isSnowflake(id),
		// 				message: '{VALUE} is not a valid snowflake!',
		// 			},
		// 		}],
		// 	},
		// 	channel: {
		// 		type: String,
		// 		validate: {
		// 			validator: id => utils.isSnowflake(id),
		// 			message: '{VALUE} is not a valid snowflake!',
		// 		},
		// 	},
		// 	suggestions: [suggestionSchema],
		// },
		tickets: {
			...pluginDefaults,
			category: {
				type: String,
				validate: {
					validator: id => utils.isSnowflake(id),
					message: '{VALUE} is not a valid snowflake!',
				},
			},
		},
		misc: {
			...pluginDefaults,
		},
		economy: {
			...pluginDefaults,
			name: {
				type: String,
				maxlength: 24,
				default: 'Gems',
			},
			symbol: {
				type: String,
				maxlength: 24,
				default: '💎',
			},
		},
		levels: {
			...pluginDefaults,
			rewards: [{
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
				role: {
					type: String,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
			}],
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
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
				action: {
					type: String,
					validate: {
						validator: id => utils.isSnowflake(id),
						message: '{VALUE} is not a valid snowflake!',
					},
				},
				error: {
					type: String,
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
							'*atlasbot.xyz*',
							'*atlasbot.xyz*',
							'*discordapp.com*',
							'*discord.gg*',
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
		// all of these are more or less ignored, more temporary then anything
		feeds: {
			...pluginDefaults,
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
					default: 'Welcome to {guild.name} {user.mention}! Make sure to follow the rules and be respectful of other members.',
				},
			},
		},
		utilities: {
			...pluginDefaults,
		},
	},
});

module.exports = guildSchema;
