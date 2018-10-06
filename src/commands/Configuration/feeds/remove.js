const Command = require('../../../structures/Command.js');

module.exports = class Remove extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const [type, channelQuery] = args;
		let [,, target] = args;

		if (!type) {
			return responder.error('feeds.remove.noType').send();
		}
		if (!channelQuery) {
			return responder.error('feeds.remove.noChannel').send();
		}
		if (!target) {
			return responder.error('feeds.remove.noTarget').send();
		}

		// grabbing and validating the channel
		const channel = (new this.Atlas.structs.Fuzzy(msg.guild.channels, {
			keys: ['name', 'id', 'mention'],
		})).search(channelQuery);

		if (!channel) {
			return responder.error('feeds.remove.noChannel').send();
		}

		if (type === 'reddit') {
			target = this.Atlas.lib.utils.cleanSubName(target);
		}

		const key = target.toLowerCase();
		const entry = settings.plugin('feeds').services.find(c => c.channel === channel.id && c.target === key);

		if (entry) {
			await settings.update({
				$pull: {
					'plugins.feeds.services': {
						_id: entry._id,
					},
				},
			});

			// todo: some services may not support lowercasing targets
			if (this.Atlas.feedHandler.services[type] && this.Atlas.feedHandler.services[type].has(key)) {
				const val = this.Atlas.feedHandler.services[type].get(key);
				const cleaned = val.filter(c => c.channel.id !== channel.id);
				this.Atlas.feedHandler.services[type].set(key, cleaned);
			}

			return responder.text('feeds.remove.success', channel.mention, type, target).send();
		}

		return responder.error('feeds.remove.noEntry').send();
	}
};

module.exports.info = {
	name: 'remove',
	aliases: [
		'delete',
	],
	examples: [
		'reddit #general AskReddit',
		'reddit #reddit-feeds funny',
	],
	guildOnly: true,
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			manageWebhooks: true,
		},
	},
};
