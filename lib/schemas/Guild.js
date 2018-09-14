const mongoose = require('mongoose');
const utils = require('./../utils');

const actionSchema = require('./Action');
const ticketSchema = require('./Ticket');
const infractionSchema = require('./Infraction');
const suggestionSchema = require('./Suggestion');
const muteSchema = require('./Mute');


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
		default: 'a!',
	},
	locale: {
		type: String,
	},
	command_options: [{
		label: {
			type: String,
		},
		cooldown: {
			type: Number,
			min: 2000,
			max: 300000,
		},
		auto_delete: {
			type: Boolean,
			default: false,
		},
		silent: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		blacklist: {
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
		},
	}],
	plugins: {
		suggestions: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'disabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			channel: {
				type: String,
				validate: {
					validator: id => utils.isSnowflake(id),
					message: '{VALUE} is not a valid snowflake!',
				},
			},
			suggestions: [suggestionSchema],
		},
		tickets: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'disabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			category: {
				type: String,
				validate: {
					validator: id => utils.isSnowflake(id),
					message: '{VALUE} is not a valid snowflake!',
				},
			},
			tickets: [ticketSchema],
		},
		misc: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
		},
		economy: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'disabled',
			},
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
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
		},
		levels: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'disabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
		},
		moderation: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			infractions: [infractionSchema],
			mutes: [muteSchema],
			filters: {
				// Chat filters
				blacklist: {
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
					list: [{
						type: String,
						trim: true,
						lowercase: true,
					}],
					sanction_bots: {
						type: Boolean,
						default: false,
					},
				},
				// Chat filters
				cursing: {
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
				},
				// Excessive caps
				capitalization: {
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
					sanction_bots: {
						type: Boolean,
						default: false,
					},
					exempt_roles: [{
						type: String,

						validate: {
							validator: id => utils.isSnowflake(id),
							message: '{VALUE} is not a valid snowflake!',
						},
					}],
				},
				// Links
				links: {
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
					exclusions: {
						type: Array,
						default: [
							'*get-atlas.xyz*',
							'*atlasbot.xyz*',
							'*discordapp.com*',
							'*discord.gg*',
						],
					},
				},
				invites: {
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
					exclusions: {
						type: Array,
						default: [],
					},
				},
				mentions: {
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
					threshold: {
						type: Number,
						default: 5,
					},
				},
				spam: {
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
					limit: {
						type: Number,
						default: 6,
					},
				},
			},
		},
		utilities: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
		},
		feeds: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'disabled',
			},
			autorole: [{
				type: String,
				required: true,
				validate: {
					validator: id => utils.isSnowflake(id),
					message: '{VALUE} is not a valid snowflake!',
				},
			}],
			subreddits: [{
				name: {
					type: String,
					required: true,
				},
				addedBy: {
					type: String,
					required: true,
				},
				channel: {
					type: String,
					required: true,
				},
			}],
			youtube: [{
				name: {
					type: String,
					required: true,
				},
				addedBy: {
					type: String,
					required: true,
				},
				channel: {
					type: String,
					required: true,
				},
			}],
			messages: {
				public_message: {
					enabled: {
						type: Boolean,
						default: false,
					},
					content: {
						type: String,
						default: 'Welcome to {guild.name} {user.mention}!',
					},
					channel: {
						type: String,
						trim: true,
					},
					embed: {
						type: Boolean,
						default: false,
					},
					embed_title: {
						type: String,
						default: null,
					},
				},
				direct_message: {
					enabled: {
						type: Boolean,
						default: false,
					},
					content: {
						type: String,
						default: 'Welcome to {guild.name} {user.mention}!',
					},
					embed: {
						type: Boolean,
						default: false,
					},
					embed_title: {
						type: String,
						default: null,
					},
				},
				leave_message: {
					enabled: {
						type: Boolean,
						default: false,
					},
					content: {
						type: String,
						default: '{user.username} has left {guild.name} :c',
					},
					channel: {
						type: String,
						trim: true,
					},
					embed: {
						type: Boolean,
						default: false,
					},
					embed_title: {
						type: String,
						default: null,
					},
				},
			},
		},
		actions: {
			state: {
				type: String,
				enum: ['disabled', 'enabled'],
				default: 'enabled',
			},
			blacklist: {
				mode: {
					type: String,
					enum: ['blacklist', 'whitelist'],
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
			actions: [actionSchema],
		},
	},
});

guildSchema.statics.findOneOrCreate = async function findOneOrCreate(id) {
	const self = this;
	const data = await self.findOne(id);
	if (!data) {
		return self.create(id);
	}

	return data;
};

module.exports = guildSchema;
