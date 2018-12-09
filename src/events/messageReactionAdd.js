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
			const settings = await this.Atlas.DB.getSettings(msg.guild.id);

			await settings.runActions({
				guild: msg.guild.id,
				'trigger.type': 'reactionAdd',
				// emoji.id is only set for custom emojis, otherwise atlas uses the emoji as the content
				'trigger.content': emoji.id || emoji.name,
			}, {
				msg,
				user,
			});
		}
	}
};
