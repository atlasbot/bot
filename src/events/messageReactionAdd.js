const mongoose = require('mongoose');

const emojiUtil = require('../../lib/emoji');
const Action = require('../structures/Action');

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
			// this mess will get the guilds settings and check to see if there are any triggers for it

			// emoji.id is only set if it's a custom emoji, which is what is stored as 'trigger.content' for custom emojis.
			const query = emoji.id || (() => {
				const e = emojiUtil.get(emoji.name);

				if (e) {
					return e.name;
				}
			})();

			const actions = (await mongoose.model('Action').find({
				guild: msg.guild.id,
				'trigger.content': query,
			}));

			if (actions.length) {
				const settings = await this.Atlas.DB.getGuild(msg.guild.id);

				for (const action of actions.map(a => new Action(settings, a))) {
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
						console.error(e);
					}
				}
			}
		}
	}
};
