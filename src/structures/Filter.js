module.exports = class Filter {
	constructor(Atlas, info) {
		this.info = info;
		this.Atlas = Atlas;

		this.execute = this.execute.bind(this);
	}

	async checkMessage(settings, msg) {
		const plugin = settings.plugin('moderation');
		const filterConfig = plugin.filters[this.info.settingsKey];

		if (!filterConfig) {
			console.error('Missing filter config for filter ', this.info);
		}

		const perms = msg.channel.permissionsOf(this.Atlas.client.user.id);

		// jesus christ
		if (
			// if moderation is disabled
			(settings.plugin('moderation').state === 'disabled'
			// if the filter is disabled
				|| filterConfig.action === 0
				// if the msg author is a bot and we're not meant to sanction them
				|| (msg.author.bot && filterConfig.sanction.bots !== true))
				// if the message is from ourselves
				|| msg.author.id === this.Atlas.client.user.id
				// if there is no member that sent the message (somethines things fake messages idk man)
				|| !msg.member
				// if we aren't allowed to manage messages
				|| !perms.has('manageMessages')
				// if the member has manageMessages perms and we aren't allowed to touch them
				|| (msg.member.permission.has('manageMessages') && !filterConfig.sanction.moderators)
				// if the channel is exempt
				|| filterConfig.exempt.channels.includes(msg.channel.id)
				// if the user has an exempt role
				|| filterConfig.exempt.roles.find(r => msg.member.roles && msg.member.roles.includes(r))
				// i'm not 100% sure about this, some people may just do it so the bot is silent
				// but on the other hand it may confuse people if atlas randomly deletes messages
				|| !perms.has('sendMessages')
		) {
			return false;
		}
		// here is some eye bleach for that if statement https://i.imgur.com/uJV5MgX.jpg
		// if anyone wants to clean that up then you're more then welcome

		const restrictionError = this.Atlas.lib.utils.checkRestriction({
			roles: (msg.member && msg.member.roles) || [],
			channel: msg.channel.id,
		}, plugin.restrictions);

		// dont run filters on users that are blacklisted or whitelisted
		if (restrictionError) {
			return;
		}

		for (const str of [msg.content, msg.cleanContent]) {
			const output = await this.execute(str, msg, {
				filterConfig,
			});

			if (output) {
				const responder = new this.Atlas.structs.Responder(msg, settings.lang);

				if (filterConfig.action === 1 || filterConfig.action === 2) {
					if (Array.isArray(output)) {
						if (output.every(id => this.Atlas.lib.utils.isSnowflake(id))) {
							await msg.channel.deleteMessages(output);
						}
					} else {
						await msg.delete();
					}
				}

				if (filterConfig.action === 2 || filterConfig.action === 3) {
					// warn the user
					await settings.addInfraction({
						target: msg.author,
						moderator: settings.guild.me,
						reason: responder.format(`general.filters.messages.${this.info.settingsKey}.warning`),
					});
				}

				// special handling for phrases to tell them what they said that got them into the bad boi group
				if (this.info.settingsKey === 'phrases') {
					try {
						await responder
							.dm(msg.author)
							.text(`general.filters.messages.${this.info.settingsKey}.dm`, output, msg.guild.name)
							.send();
					} catch (e) {} // eslint-disable-line no-empty
				}

				return !!(
					await responder
						.text(`general.filters.messages.${this.info.settingsKey}.message`, msg.author.mention)
						.ttl(5)
						.send()
				);
			}
		}

		return false;
	}
};
