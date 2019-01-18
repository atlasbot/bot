const Cache = require('atlas-lib/lib/structures/Cache');

const Action = require('../structures/Action');

const ratelimits = new Cache('ratelimits');
const botlimits = new Cache('botlimits');

const PREFIXES = process.env.PREFIXES.split(',');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	/**
	 * Executes the message handler
	 * The goal is to keep per-message performance high
	 *
	 * @param {Message} msg The message sent
	 */
	async execute(msg) {
		// while atlas works fine in dm's and previously supported them
		// for reasons of not wanting to overcomplicate things, i've disabled it
		// also basically no one used dm support
		if (!msg.guild || msg.type !== 0) {
			return;
		}

		const settings = await this.Atlas.DB.settings(msg.guild.id);

		// chat filters
		for (const [, filter] of this.Atlas.filters) {
			// test the filter with the message
			const output = await filter.checkMessage(settings, msg);

			if (output === true) {
				// a filter triggered, we don't want to spam them with "YOU DID A BAD", just one is enough
				// we also don't want to let them run commands on filter trigger because they could be abusing something
				return;
			}
		}

		msg.lang = settings.lang;
		// displayPrefix is the guild's prefix and one we should show in help, etc..
		msg.displayPrefix = settings.prefix;
		// msg.prefix is the prefix they actually used
		msg.prefix = this.checkPrefix(msg.content, settings);

		if (msg.prefix) {
			// args are split at any spaces
			// this does have a few sideaffects
			msg.args = msg.content.replace(/<@!/g, '<@').substring(msg.prefix.length).trim().split(/ +/g);
			msg.label = msg.args.shift().toLowerCase();

			msg.command = this.Atlas.commands.get(msg.label);
		}

		// try and find an action, if one exists it'll run it then do nothing.
		const actions = await this.Atlas.DB.get('actions').find({
			// where the action's guild is this guild
			guild: msg.guild.id,
			$or: [{
				// get "messageCreate" actions with the channel set to anything/channel set to the msg's channel
				'trigger.type': 'messageCreate',
				$or: [{
					'trigger.content': msg.channel.id,
				}, {
					'trigger.content': null,
				}, {
					'trigger.content': undefined,
				}],
			}, {
				// command actions where the label is the command's label
				'trigger.type': 'label',
				'trigger.content': msg.label,
			}, {
				// keyword actions
				// mongodb doesn't have an easy way to find "where string includes document value"
				// so we have to check the match ourselves
				'trigger.type': 'keyword',
			}],
		});

		const runActions = [];
		for (const rawAction of actions) {
			const limited = await botlimits.get(msg.guild.id);

			// if it's a keyword and the msg contint doesn't actually include the keyword then skip it
			if (rawAction.trigger.type === 'keyword' && !msg.content.toLowerCase().includes(rawAction.trigger.content.toLowerCase())) {
				continue;
			}

			if (rawAction.trigger.type === 'messageCreate' && msg.author.bot) {
				// bots can only trigger messageCreate every 5 minutes to prevent any serious abuse
				// this could still be used to create loops but every 5m isn't a big deal
				if (limited) {
					continue;
				}

				// set a cached key for the guild to true, it will delete itself in 5m (300s)
				await botlimits.set(msg.guild.id, true, 300);
			}

			const action = new Action(settings, rawAction);

			try {
				await action.execute(msg);

				runActions.push(rawAction);

				if (actions.length !== 1) {
					// sleep for 1s to prevent abuse
					// this will slow down downstream commands but if it does then don't have so many actions smh
					await this.Atlas.lib.utils.sleep(1000);
				}
			} catch (e) {
				this.Atlas.Sentry.captureException(e);
			}
		}

		// if an "custom command" was called, don't do anything.
		if (runActions.find(a => a.trigger.type === 'label' && a.trigger.content === msg.label)) {
			return;
		}

		if (msg.author.bot) {
			// we don't want to run our commands for bots
			return;
		}

		const levels = settings.plugin('levels');

		if (levels.state === 'enabled' && !msg.label) {
			this.updateProfile(msg, settings);
		} else {
			this.Atlas.util.updateUser(msg.author);
		}

		if (msg.command) {
			const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'general.plugin');
			const plugin = settings.plugin(msg.command.plugin.name);
			const { subcommands } = msg.command;

			// guild-only checks
			// handle guild things

			if (plugin) {
				const override = msg.member.permission.has('manageGuild') && ['toggleplugin', 'togglecommand'].includes(msg.command.info.name);

				if (plugin.state === 'disabled' && !override) {
					const showSetup = !Object.values(settings.raw.plugins).some(p => p.state === 'enabled' && msg.member.permission.has('manageGuild'));

					if (!showSetup) {
						// they're a regualr user and aren't trying to toggle something so hit them with that no
						return responder.error('disabled', msg.command.plugin.name, msg.command.info.name).send();
					}

					// if the command is 'help' and all their plugins are disabled, they're probably new
					// so show them a friendly message to get them started
					return responder.embed({
						title: 'general.welcome.title',
						description: 'general.welcome.description',
						footer: {
							text: 'general.welcome.footer',
						},
					}).send();
				}

				// checks plugin blacklist/whitelists and returns a locale error key (blacklist.role, whitelist.role)
				// if the user doesn't have perms
				const errorKey = this.Atlas.lib.utils.checkRestriction({
					roles: msg.member.roles || [],
					channel: msg.channel.id,
				}, plugin.restrictions);

				if (errorKey) {
					return responder.error(`restrictions.${errorKey}`).send();
				}
			}

			// find subcommands matching the first arg
			// we intentionally do this after the above checks because
			// subcommands inherit restrictions or other settings from their parent
			if (msg.args[0] && subcommands.size) {
				const subcommand = subcommands.get(msg.args[0]);

				if (subcommand) {
					// wew we found one, remove the first arg
					msg.args.shift();
					// set the command to the subcommand we're using
					msg.command = subcommand;
				}
			}

			if (process.env.VERBOSE === 'true') {
				console.log(`executing ${msg.command.info.name} ${Date.now()}`);
			}

			try {
				// try run the command
				return await msg.command.execute(msg, msg.args, {
					settings,
				});
			} catch (e) {
				// thanks to the "return await", if it throws an error we'll catch it and report it manually
				console.error(e);

				// sentry doesn't have a non-bullshit way to attach extra data anymore (like args used to recreate the error)
				this.Atlas.Sentry.captureException(e);
			}
		}
	}

	/**
	 * Checks the message content for a matching prefix
	 * @param {string} content The string to check
	 * @param {Settings} settings The guild's settings
	 * @returns {string|void} The prefix if one is found, otherwise void
	 */
	checkPrefix(content, settings = {}) {
		// get an array of valid prefixes [a!, @mention]
		const prefixes = settings.prefix ? [settings.prefix, ...PREFIXES] : PREFIXES;

		for (let prefix of prefixes) {
			prefix = prefix.replace(/@mention/g, this.Atlas.client.user.mention);

			// replace magic means the @mention prefix will still match if it's a nickname (<@!userid> vs <@userid>)
			if (content.replace(/<@!/g, '<@').startsWith(prefix)) {
				return prefix;
			}
		}
	}

	/**
	 * Gives a user levels when needed
	 * @param {Message} msg The message to use info from
	 * @param {Settings} settings The guild's settings to check... for settings
	 * @returns {Promise<void>}
	 */
	async updateProfile(msg, settings) {
		const plugin = settings.plugin('levels');
		const limit = await ratelimits.get(msg.author.id);

		// above will check if the plugin is enabled before calling it so it's not needed here

		// if the user is ratelimited then we do nothing
		if (limit) {
			return;
		}

		// set a ratelimit so the user can't gain levels for 60s
		await ratelimits.set(msg.author.id, Date.now(), 60);

		const restrictionError = this.Atlas.lib.utils.checkRestriction({
			roles: msg.member.roles || [],
			channel: msg.channel.id,
		}, plugin.restrictions);

		// if levels are enabled and the channel/user is not blacklisted, then... wew
		if (restrictionError) {
			return;
		}

		const payload = {
			username: msg.author.username,
			discriminator: msg.author.discriminator,
			avatar: msg.author.avatar,
		};

		// the amount of xp to reward them with
		const xp = this.Atlas.lib.xputil.calcXP(msg.content);

		const profile = await this.Atlas.DB.user(msg.author, msg.guild.id);

		const guild = (profile.guilds || []).find(({ id }) => id === msg.guild.id);

		if (guild) {
			// update existing guild profile
			await this.Atlas.DB.get('users').update({ id: profile.id, 'guilds._id': guild._id }, {
				$set: payload,
				$inc: {
					'guilds.$.xp': xp,
					'guilds.$.messages': 1,
				},
			});
		} else {
			const guilds = (profile.guilds || []).filter(g => g.id !== msg.guild.id);

			await this.Atlas.DB.get('users').update({ id: profile.id }, {
				$set: {
					...payload,
					guilds: [
						...guilds,
						profile,
					],
				},
			});
		}

		const currentXP = guild ? guild.xp + xp : xp;

		// will announce level ups and reward roles when needed
		this.Atlas.util.levelup(msg.member, {
			previous: this.Atlas.lib.xputil.getUserXPProfile(guild ? guild.xp : 0),
			current: this.Atlas.lib.xputil.getUserXPProfile(currentXP),
		}, msg, settings);

		return profile;
	}
};
