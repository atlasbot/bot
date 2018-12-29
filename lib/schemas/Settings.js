const mongoose = require('mongoose');

const CommandOption = require('./CommandOption');
const Mute = require('./Mute');
const LevelReward = require('./LevelReward');
const discordId = require('../mongoSnowflake');

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
		roles: [discordId],
		channels: [discordId],
	},
};

const filterDefaults = {
	action: {
		type: Number,
		default: 0,
	},
	exempt: {
		channels: [discordId],
		roles: [discordId],
	},
	sanction: {
		bots: {
			type: Boolean,
			default: false,
		},
		moderators: {
			type: Boolean,
			default: false,
		},
	},
};

/*
	The actual juice
*/
const guildSchema = new mongoose.Schema({
	id: {
		...discordId,
		unique: true,
		required: true,
	},
	// persistent tag storage, stored as [[key, value], [key, value]] for ez `new Map(persistent)`
	persistent: [{
		type: Array,
	}],
	// Server's prefix
	prefix: {
		type: String,
		default: process.env.DEFAULT_PREFIX,
	},
	// Servers preferred language
	lang: {
		type: String,
	},
	// Command options, this might have to move, who knows
	command_options: [CommandOption],
	// The juice
	plugins: {
		// The role plugin, where you can let users give themselves roles, setup join roles and reaction roles. All the role things.
		roles: {
			...pluginDefaults,
			join: discordId,
			iam: [discordId],
			reactions: [{
				reaction: {
					type: String,
					required: true,
				},
				role: discordId,
				channel: discordId,
				message: discordId,
			}],
		},
		// info (previously "misc"), help commands, etc... - boring stuff.
		info: pluginDefaults,
		// Levels, users can level up and gain XP/role rewards.
		levels: {
			...pluginDefaults,
			options: {
				rewards: [LevelReward],
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
		// Music. What it says on the tin, you can listen to music in a voice channel.
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
		// Fun commands, mostly simple for shits and giggles.
		fun: pluginDefaults,
		// moderation, one of/the biggest plugins - filters, mutes, logging, a lot of moderation commands
		moderation: {
			...pluginDefaults,
			logs: {
				mod: discordId,
				action: discordId,
				error: discordId,
			},
			mute_role: discordId,
			mutes: [Mute],
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
		// greetings for new members and soon probably some other stuff
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
				channel: discordId,
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
				channel: discordId,
				content: {
					type: String,
					default: '{user.mention} has left {guild.name} :c.',
				},
			},
		},
		// utilities, mostly simple commands like "fun" but not fun
		utilities: pluginDefaults,
	},
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
});

guildSchema.index({
	id: 1,
});

module.exports = guildSchema;
