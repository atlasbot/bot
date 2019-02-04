const Parser = require('./../tagengine');

module.exports = class Action {
	constructor(settings, action) {
		this.Atlas = require('./../../Atlas');
		this.guild = this.Atlas.client.guilds.get(settings.id);

		this.settings = settings;

		// if (action.toObject) {
		// 	// in other news fuck mongoose and it's weirdness (although i also kind of love it sometimes)
		// 	action = action.toObject();
		// }

		this.trigger = {
			type: action.trigger.type,
			content: action.trigger.content,
		};

		this.restrictions = action.restrictions;

		if (action.content) {
			this.content = action.content
				.map(sa => ({
					// mongoose doesnt like spread operator on it's fancy/actually the antichrist fake objects that drive me insane
					...sa.toObject ? sa.toObject() : sa,
					type: this.trigger.type === 'interval' ? 'channel' : sa.type,
					channel: this.guild && this.guild.channels.get(sa.channel),
				}))
				.filter(c => (this.trigger.type === 'interval' ? c.channel : true));

			this.flags = {
				ttl: action.flags.ttl,
				cooldown: action.flags.cooldown,
				enabled: action.flags.enabled,
				silent: action.flags.silent,
				delete: action.flags.delete,
				quiet: action.flags.quiet,
			};
		}
	}

	get quiet() {
		return this.flags.quiet || this.flags.silent;
	}

	get emoji() {
		return this.Atlas.lib.utils.getActionEmoji(this, this.guild);
	}

	/**
	 * Executes the action on a message, assuming it's already been checked to be appropriate for the message.
	 * @param {Message} msg The message to run on.
	 */
	async execute(msg) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang || this.settings.lang, 'general.action');

		if (this.flags.enabled === false) {
			// keywords can be triggered a lot, and spamming that it's disabled would get annoying.
			if (this.quiet || this.trigger.type === 'keyword') {
				return;
			}

			return responder.error('disabled').send();
		}

		if (!['interval', 'guildMemberAdd', 'guildMemberRemove'].includes(this.trigger.type)) {
			const errorKey = this.Atlas.lib.utils.checkRestriction({
				roles: msg.member.roles,
				channel: msg.channel.id,
				permissions: msg.channel.permissionsOf(msg.member.id),
			}, this.restrictions);

			if (errorKey) {
				if (this.quiet) {
					return;
				}

				return responder.error(`restrictions.${errorKey}`).send();
			}
		}

		// the dashboard prevents users from removing the last subaction but the api doesn't (which is intentional for future use)
		// this is more of a "oh shit they did something they can't do at the time of writing this" message
		if (!this.content.length) {
			return responder.error('noSubActions').send();
		}

		const perms = msg.channel && msg.channel.permissionsOf(this.Atlas.client.user.id);
		if (this.flags.delete && perms && perms.has('manageMessages') && msg.delete) {
			msg.delete().catch(() => false);
		}

		for (const subaction of this.content) {
			try {
				await this.runSubAction(msg, subaction);

				if (this.content.length !== 1) {
					// sleep for 1s between each subaction to prevent abuse
					await this.Atlas.lib.utils.sleep(1000);
				}
			} catch (e) {
				this.Atlas.Sentry.captureException(e);

				console.warn(e);
			}
		}
	}

	async runSubAction(msg, {
		type,
		message,
		channel,
		fallback,
	}) {
		const responder = (new this.Atlas.structs.Responder(msg.channel, this.settings.lang)).localised(true);

		if (type !== 'dm') {
			const target = channel || msg.channel;

			if (!target.permissionsOf(this.Atlas.client.user.id).has('sendMessages')) {
				// not much we can do if we dont have perms
				return;
			}
		}

		const parser = new Parser({
			msg,
			settings: this.settings,
			action: this,
			guild: this.guild,
		});

		const { output } = await parser.parse(message);

		if (!output || this.flags.silent) {
			return;
		}

		if (type === 'dm') {
			try {
				const out = await responder.dm(msg.author).text(output).send();

				return out;
			} catch (e) {
				if (fallback) {
					// try fallback to invocation channel

					return responder.channel(msg.channel).text(output).send();
				}

				return;
			}
		}

		const target = channel || msg.channel;

		if (!target) {
			return;
		}

		return responder.channel(target).text(output).send();
	}
};
