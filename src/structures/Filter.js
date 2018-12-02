module.exports = class Filter {
	constructor(Atlas, info) {
		this.info = info;
		this.Atlas = Atlas;

		this.execute = this.execute.bind(this);
	}

	async checkMessage(settings, msg) {
		const filterConfig = settings.plugin('moderation').filters[this.info.settingsKey];

		// jesus christ
		if (
			(msg.author.bot && filterConfig.sanction_bots !== true)
            || msg.author.id === this.Atlas.client.user.id
            || !msg.guild.me.permission.json.manageMessages
            || filterConfig.exempt_channels.includes(msg.channel.id)
            || filterConfig.exempt_roles.find(r => msg.member.roles && msg.member.roles.includes(r))
            || filterConfig.action_type === 0
		) {
			return false;
		}
		// here is some eye bleach for that if statement https://i.imgur.com/uJV5MgX.jpg

		for (const str of [msg.content, msg.cleanContent]) {
			const output = await this.execute(str, msg, {
				filterConfig,
			});

			if (output) {
				const responder = new this.Atlas.structs.Responder(msg);

				if (filterConfig.action_type === 1 || filterConfig.action_type === 2) {
					if (Array.isArray(output)) {
						if (output.every(id => this.Atlas.lib.utils.isSnowflake(id))) {
							await msg.channel.deleteMessages(output);
						}
					} else {
						await msg.delete();
					}
				}

				if (filterConfig.action_type === 2 || filterConfig.action_type === 3) {
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
						const channel = await msg.author.getDMChannel();

						await responder.channel(channel)
							.text(`general.filters.messages.${this.info.settingsKey}.dm`, output, msg.guild.name)
							.send();
					} catch (e) {} // eslint-disable-line no-empty
				}

				return !!(await responder.text(`general.filters.messages.${this.info.settingsKey}.message`, msg.author.mention).ttl(5).send());
			}
		}

		return false;
	}
};
