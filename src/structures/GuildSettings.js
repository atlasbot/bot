/** Represents a guild config    */
const prefixes = process.env.PREFIXES
	? 	process.env.PREFIXES.split(',')
	: 	['a!', '@mention'];
const hookCache = new Map();

// TODO: this shouldn't be created every time data is fetched from the DB (aka, cache it and reuse it)

module.exports = class GuildSettings {
/**
        * Create a new instance of a guild
        * @param {Object} settings The guilds settings from a DB
        */
	constructor(settings) {
		this.settings = settings;

		this.Atlas = require('../../Atlas');

		this.guild = this.Atlas.client.guilds.get(settings.id);
	}

	/**
    * The mute role for the server, undefined if it's not been generated
    * @readonly
    * @memberof Guild
    */
	get muteRole() {
		return this.guild.roles.get(this.settings.plugins.moderation.mute_role);
	}

	/**
    * The guilds ticket category
    * @readonly
    * @memberof Guild
    */
	get ticketCategory() {
		return this.guild.channels.get(this.settings.plugins.tickets.category);
	}

	/**
    * The ID of the server
    * @readonly
    * @memberof Guild
    */
	get id() {
		return this.settings.id;
	}

	/**
    * The prefix for the server, defaults to the first prefix in env
    * @readonly
    * @memberof Guild
    */
	get prefix() {
		return this.settings.prefix || prefixes[0];
	}

	/**
    * The server lang, defaults to DEFAULT_LANG
    * @readonly
    * @memberof Guild
    */
	get lang() {
		return this.settings.lang || process.env.DEFAULT_LANG;
	}

	/**
    * The permissions of the bot in the guild
    * @readonly
    * @memberof Guild
    */
	get botPerms() {
		return this.guild.members.get(this.Atlas.client.user.id).permission;
	}

	/**
    * The channel to log actions to
    * @readonly
    * @memberof Guild
    */
	get actionLogChannel() {
		return this.guild.channels.get(this.settings.plugins.moderation.logs.action);
	}

	/**
    * The channel to log moderator actions to
    * @readonly
    * @memberof Guild
    */
	get modLogChannel() {
		return this.guild.channels.get(this.settings.plugins.moderation.logs.mod);
	}

	/**
    * The channel to log errors to
    * @readonly
    * @memberof Guild
    */
	get errorLogChannel() {
		return this.guild.channels.get(this.settings.plugins.moderation.logs.error);
	}

	filter(name) {
		return this.settings.plugins.moderation.filters[name];
	}

	/**
    * Find a member in the guild
    * @param {string} query the query to use to find the member. Can be a user ID, username, nickname, mention, etc...
    * @param {Object} opts options
    * @param {Array} opts.members An optional members list to use
    * @param {boolean} opts.memberOnly If false, the return value could be a member or a user object
    * @param {number} opts.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
    * @returns {Promise} the member or nothing if nothing was found
    */
	findMember(query, {
		members,
		memberOnly = false,
		percent,
	} = {}) {
		return this.Atlas.util.findMember(this.guild, query, {
			members,
			memberOnly,
			percent,
		});
	}

	/**
	    * Finds a role or channel
	    * @param {string} query the search term. can be a mention, ID, name, etc..
	    * @param {Object} options Options
	    * @param {number} options.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	    * @param {string} options.type The type to search for, defaults to either role or channel. Must be either void, 'role' or 'channel'
	    * @returns {Promise<Channel|Role|Void>}
	    */
	findRoleOrChannel(query, {
		percent,
		type,
	} = {}) {
		return this.Atlas.util.findRoleOrChannel(this.guild, query, {
			percent,
			type,
		});
	}

	/**
        * Get a plugins settings
        * @param {string} name - The name of the plugin to get data for
        * @returns {Object} the plugins data
        */
	plugin(name) {
		return this.settings.plugins[name.toLowerCase()];
	}

	/**
    * Update the guild's config with new data. This will also update the local settings
    * @param {Object} settings a MongoDB query to update the guild with
    * @param {Object} opts Options
    * @param {boolean} opts.runValidators whether or not to validate the update. This does have some caveats, google is your friend.
    * @returns {Promise<Object>} The new guild's settings
    */
	async update(settings, {
		runValidators = true,
	} = {}) {
		const data = await this.Atlas.DB.Guild.findOneAndUpdate({ id: this.id }, settings, {
			runValidators,
			new: true,
		});
		this.settings = data;

		return data;
	}

	/**
    * Get options for a command by label
    * @param {string} label the label of the command to get options for
    * @returns {Object|null} the command's options
    */
	command(label) {
		const command = this.Atlas.commands.get(label);
		if (!command) {
			throw new Error(`"${label}" is not a valid command label!`);
		}

		const opts = this.settings.command_options.find(o => o.label === label);

		const parsed = Object.assign({
			label,
			auto_delete: false,
			disabled: false,
			silent: false,
			cooldown: command.info.cooldown.min,
			blacklist: {
				channels: [],
				roles: [],
			},
		}, opts ? opts.toObject() : {});

		if (this.guild) {
			parsed.blacklist.channels = parsed.blacklist.channels
				.filter(id => this.guild.channels.has(id));
			parsed.blacklist.roles = parsed.blacklist.roles
				.filter((id) => {
					const role = this.guild.channels.get(id);
					const me = this.guild.members.get(this.Atlas.client.user.id);

					return !role || role.position >= me.highestRole.position;
				});
			parsed.validated = true;
		}

		return parsed;
	}

	/**
    * Add a warning to a user
    * @param {Object} data Data
    * @param {Object} data.target The user object of the target to warn
    * @param {Object} data.moderator The moderator who issued the warn
    * @param {string} data.reason The reason the warn was issued
    * @param {boolean} data.notify Whether the target should be notified that they were warned
    * @returns {Promise} The data, data.notify is whether or not the user was notified, data.info is from mongodb.
     */
	async addWarning({ target, moderator, reason }) {
		const d = await this.update({
			$push: {
				'plugins.moderation.infractions': {
					reason,
					target: target.id,
					moderator: moderator.id,
					guild: this.id,
				},
			},
		});
		if (target.id && this.guild && this.guild.members.has(target.id)) {
			try {
				const channel = await target.getDMChannel();
				const responder = new this.Atlas.structs.Responder(channel);
				try {
					await responder.embed({
						color: this.Atlas.colors.get('red').decimal,
						title: 'Warning',
						description: `You have recieved a warning in ${this.guild.name}. Improve your behaviour or you will be removed from the server.`,
						fields: [{
							name: 'Warned By',
							value: `${moderator.mention} (\`${moderator.tag}\`)`,
							inline: true,
						}, {
							name: 'Reason',
							value: reason,
							inline: true,
						}],
						timestamp: new Date(),
						footer: {
							text: `This message was sent automatically because you recieved a warn in ${this.guild.name}. You can block Atlas if you wish to stop recieving these messages.`,
						},
					}).send();

					return {
						notified: true,
						info: d,
					};
				} catch (e) {
					return {
						notified: false,
						info: d,
					};
				}
			} catch (e) {
				console.error(e);

				return {
					notified: false,
					info: d,
				};
			}
		}
	}

	/**
    * Does what it says on a tin, removes a warning by ID
    * @param {Object|ObjectId} id The ID or Object of the warn, if an object is provided it must have an _id key
    * @returns {Promise} the update
    */
	removeWarning(id) {
		const warning = id._id ? id : this.settings.plugins.moderation.infractions.find(inf => inf._id === id);
		if (warning) {
			const payload = {
				$pull: {
					'plugins.moderation.infractions': {
						_id: warning._id,
					},
				},
			};

			return this.update(payload);
		}

		throw new Error('Invalid warning ID!');
	}

	/**
    * Gets all warnings for a user
    * @param {string} user the ID of the user
    * @param {Object} opts Options
    * @param {boolean} opts.all whether or not to return all infractions, including ones that were deleted
    * @returns {Array} An array of objects with infraction info
    */
	getWarnings(user, {
		all = false,
	} = {}) {
		const warnings = this.settings.plugins.moderation.infractions
			.filter(inf => inf.target === (user.id || user) && (!all || inf.active));

		warnings.sort((a, b) => b.date - a.date);

		return warnings;
	}

	/**
    * Logs a message into the appropriate channel in the guild if enabled
    * @param {string|array} type The type of log it is, "action", "error" or "mod"
    * @param {Object} embed the embed to send to the channel
    * @returns {Promise|Void} the message sent, or void if logging is not enabled in the guild
    */
	async log(type, embed) {
		if (Array.isArray(type)) {
			return type.forEach(t => this.log(t, embed));
		}

		let channel;
		switch (type) {
			case 'action':
				channel = this.actionLogChannel;
				break;
			case 'error':
				channel = this.errorLogChannel;
				break;
			case 'mod':
				channel = this.modLogChannel;
				break;
			default:
				throw new Error(`Unknown type "${type}"`);
		}

		if (channel) {
			try {
				const webhook = await this.getWebhook(channel, 'Atlas Action Logging');

				// using & abusing the responder to format the embed(s)
				const responder = new this.Atlas.structs.Responder(null, this.lang);

				// format embeds
				const embeds = (Array.isArray(embed) ? embed : [embed]).map((e) => {
					const parsed = responder._parseObject(e, this.lang);
					// will throw if it doesn't work correctly
					responder.validateEmbed(parsed);

					return parsed;
				});

				if (embed.length > 25) {
					throw new Error('Maximum of 25 embeds allowed.');
				}

				return this.Atlas.client.executeWebhook(webhook.id, webhook.token, {
					username: this.guild.me.nick || this.guild.me.username,
					avatarURL: this.Atlas.avatar,
					embeds,
				});
			} catch (e) {
				console.warn(e);
			}
		}
	}

	/**
    * Get a webhook for the guild
    * @param {Object|string} channel the channel to get the webhook for
    * @param {string} reason The reason to show in the modlog for the webhook
    * @param {boolean} useCache whether or not to use the webhook cache
    * @returns {Promise} the webhook
    * @memberof Guild
    */
	async getWebhook(channel, reason) {
		const channelID = channel.id || channel;

		if (hookCache.has(channelID)) {
			return hookCache.get(channelID);
		}

		if (!this.guild.me.permission.json.manageWebhooks) {
			throw new Error('No permissions to manage webhooks.');
		}

		let hook = (await this.Atlas.client.getChannelWebhooks(channelID))
			.find(w => w.channel_id === channelID && w.user.id === this.Atlas.client.user.id);

		if (!hook) {
			hook = await this.Atlas.client.createChannelWebhook(channelID, {
				name: this.Atlas.client.user.username,
			}, reason);
		}

		hookCache.set(channelID, hook);
		// keep it for 60 seconds
		setTimeout(() => hookCache.delete(channelID), 60 * 1000);

		return hook;
	}
};
