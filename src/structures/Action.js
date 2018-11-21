const Parser = require('./../tagengine');

module.exports = class Action {
	constructor(settings, action) {
		this.Atlas = require('./../../Atlas');
		this.guild = settings.guild;
		this.settings = settings;

		this.trigger = {
			type: action.trigger.type,
			content: action.trigger.content,
		};

		this.content = action.content.filter(sa => !sa.channel).map(sa => ({
			type: sa.type,
			message: sa.message,
			channel: sa.channel,
			fallback: sa.fallback,
		}));

		this.flags = {
			ttl: action.flags.ttl,
			cooldown: action.flags.cooldown,
			enabled: action.flags.enabled,
			silent: action.flags.silent,
			delete: action.flags.delete,
			quiet: action.flags.quiet,
		};

		this.banned = {
			roles: action.banned.roles.filter(r => this.guild.roles.has(r)),
			channels: action.banned.channels.filter(c => this.guild.channels.has(c)),
		};

		this.allowed = {
			roles: action.allowed.roles.filter(r => this.guild.roles.has(r)),
			channels: action.allowed.channels.filter(c => this.guild.channels.has(c)),
		};
	}

	/**
	 * Executes the action on a message, assuming it's already been checked to be appropriate for the message.
	 * @param {Message} msg The message to run on.
	 */
	async execute(msg) {
		const responder = new this.Atlas.structs.Responder(msg, 'general.action');

		if (this.flags.enabled === false) {
			// keywords can be triggered a lot, and spamming that it's disabled would get annoying.
			if (this.flags.quiet || this.trigger.type === 'keyword') {
				return;
			}

			return responder.error('disabled').send();
		}

		if (this.banned.channels.includes(msg.channel.id)) {
			return responder.error('banned.channel').send();
		}

		if (msg.member.roles && msg.member.roles.some(r => this.banned.roles.includes(r))) {
			if (this.flags.quiet) {
				return;
			}

			return responder.error('banned.role').send();
		}

		// only enable whitelisting when > 1 role count
		if (this.allowed.roles.length && !msg.member.roles.some(r => !this.allowed.roles.includes(r))) {
			if (this.flags.quiet) {
				return;
			}

			return responder.error('whitelist.role').send();
		}

		if (this.allowed.channels.length && !this.allowed.channels.includes(msg.channel.id)) {
			return responder.error('whitelist.channel').send();
		}

		// checks pass

		// the dashboard prevents users from removing the last subaction but the api doesn't (which is intentional for future use)
		// this is more of a "oh shit they did something they can't do at the time of writing this" message
		if (!this.content.length) {
			return responder.error('noSubActions').send();
		}

		// todo: maybe timeouts between uses? or something to stop abuse
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

		// todo: move to guild settings struct with automatic error reporting so it doesn't have to be handled each time
		const { output } = await parser.parse(message);

		if (!output) {
			return;
		}

		if (!this.flags.silent) {
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
				}
			}

			if (type === 'channel') {
				const target = channel ? this.guild.channels.get(channel) : msg.channel;

				if (!target) {
				// todo: log that it's misconfigured to the guild log
					return;
				}

				return responder.channel(target).text(output).send();
			}
		}
	}
};
