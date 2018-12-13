const Parser = require('./../tagengine');

module.exports = class Action {
	constructor(settings, action) {
		this.Atlas = require('./../../Atlas');
		this.guild = this.Atlas.client.guilds.get(settings.id);

		if (action.toObject) {
			// in other news fuck mongoose and it's weirdness (although i also kind of love it sometimes)
			action = action.toObject();
		}

		this.settings = settings;

		this.trigger = {
			type: action.trigger.type,
			content: action.trigger.content,
		};

		this.restrictions = {
			roles: action.restrictions.roles,
			channels: action.restrictions.channels,
			mode: action.restrictions.mode,
		};

		if (action.content) {
			this.content = action.content
				.map(sa => ({
					...sa,
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

		if (this.trigger.type !== 'interval') {
			const { roles, channels } = this.restrictions;

			if (this.restrictions.mode === 'whitelist') {
				if (channels.length && !channels.includes(msg.channel.id)) {
					if (this.quiet) {
						return;
					}

					return responder.error('whitelist.channel').send();
				}

				if (roles.length && !msg.member.roles.some(id => roles.includes(id))) {
					if (this.quiet) {
						return;
					}

					return responder.error('whitelist.role').send();
				}
			} else {
				if (channels.includes(msg.channel.id)) {
					if (this.quiet) {
						return;
					}

					return responder.error('banned.channel').send();
				}

				if (msg.member.roles.some(id => roles.includes(id))) {
					if (this.quiet) {
						return;
					}

					return responder.error('banned.role').send();
				}
			}
		}

		// the dashboard prevents users from removing the last subaction but the api doesn't (which is intentional for future use)
		// this is more of a "oh shit they did something they can't do at the time of writing this" message
		if (!this.content.length) {
			return responder.error('noSubActions').send();
		}

		for (const subaction of this.content) {
			try {
				await this.runSubAction(msg, subaction);
			} catch (e) {
				console.error(e);
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

		const parser = new Parser({
			msg,
			settings: this.settings,
			action: this,
			guild: this.guild,
		});

		const { output } = await parser.parse(message);

		if (!output) {
			return;
		}

		if (this.flags.silent) {
			return;
		}

		if (type === 'dm') {
			try {
				const dmChannel = await msg.author.getDMChannel();

				const out = await responder.channel(dmChannel).text(output).send();

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
