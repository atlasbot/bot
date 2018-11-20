module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		const user = this.Atlas.client.users.get(userID);
		const collectors = this.Atlas.collectors.emojis.get(msg.id) || this.Atlas.collectors.emojis.get(userID);

		if (userID === this.Atlas.client.user.id) {
			return;
		}

		if (!msg.author) {
			msg = await this.Atlas.client.getMessage(msg.channel.id, msg.id);
		}

		if (collectors && collectors[0]) {
			collectors.forEach(c => c.fire(msg, emoji, userID));
		}

		// in a dev environment this will let people re-run commands
		if (this.Atlas.env === 'development' && emoji.name === '🔁') {
			if (userID === msg.author.id) {
				try {
					await this.Atlas.client.purgeChannel(msg.channel.id, 100, m => m.author.bot, null, msg.id);

					await this.Atlas.client.removeMessageReaction(
						msg.channel.id,
						msg.id,
						'🔁',
						userID,
					);
				} catch (e) {} // eslint-disable-line no-empty

				this.Atlas.client.emit('messageCreate', msg);
			}
		}

		if (msg.guild && user) {
			const settings = await this.Atlas.DB.getGuild(msg.guild.id);

			const actions = settings.actions.filter((a) => { // eslint-disable-line array-callback-return
				if (a.trigger.type === 'reaction') {
					const isCustom = this.Atlas.lib.utils.isSnowflake(a.trigger.content);
					if (isCustom) {
						return a.trigger.content === emoji.id;
					}

					const data = this.Atlas.lib.emoji.get(a.trigger.content);

					// todo: there is a pretty high chance that this won't work for some emojis.
					if (data && data.char === emoji.name) {
						return true;
					}
				}
			});

			for (const action of actions) {
				try {
					// basically immitating a message with the user that added the reaction as the author
					await action.execute({
						author: user,
						guild: msg.guild,
						member: msg.guild.members.get(user.id),
						channel: msg.channel,
						lang: settings.lang,
					});
				} catch (e) {
					// todo: log to guild
					console.error(e);
				}
			}
		}
	}
};
