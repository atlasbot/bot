const superagent = require('superagent');
const url = require('url');

const Command = require('../../../structures/Command.js');

const types = [
	'reddit',
];

module.exports = class Add extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const [, channelQuery] = args;
		let [type,, target] = args;

		if (!type) {
			return responder.error('feeds.add.noType').send();
		}
		if (!channelQuery) {
			return responder.error('feeds.add.noChannel').send();
		}
		if (!target) {
			return responder.error('feeds.add.noTarget').send();
		}

		type = type.toLowerCase();

		// validating the type, something like "reddit"
		if (!types.includes(type)) {
			return responder.error('feeds.add.unknownType');
		}

		// grabbing and validating the channel
		const channel = (new this.Atlas.structs.Fuzzy(msg.guild.channels, {
			keys: ['name', 'id', 'mention'],
		})).search(channelQuery);

		if (!channel) {
			return responder.error('feeds.add.noChannel').send();
		}

		// validating the target
		switch (type) {
			case 'reddit':
				target = this.Atlas.lib.utils.cleanSubName(target);
				// validating reddit subreddits
				try {
					// will throw if it doesn't exist
					await superagent.head(`https://www.reddit.com/r/${target}.json`)
						.set('User-Agent', this.Atlas.userAgent);
				} catch (e) {
					if (!e.response || !e.status || e.status < 200 || e.status >= 500) {
						throw e;
					}

					if (e.status === 404) {
						return responder.error('feeds.add.invalidSubreddit', target).send();
					}

					const { location } = e.response.headers;

					if (location) {
						const { pathname } = url.parse(location);
						if (pathname.startsWith('/subreddits/search')) {
							return responder.error('feeds.add.invalidSubreddit', target).send();
						}
					}
				}
				break;
			default:
				return responder.error('feeds.add.unknownType').send();
		}

		const key = target.toLowerCase();

		const existing = settings.plugin('feeds').services
			.find(s => s.type === type && s.key === key && s.channel === channel.id);

		if (existing) {
			return responder.error('feeds.add.alreadyExists').send();
		}

		// everything is good to go

		await settings.update({
			$push: {
				'plugins.feeds.services': {
					addedBy: msg.author.id,
					channel: channel.id,
					target,
					type,
				},
			},
		});

		// todo: some services may not support lowercasing targets
		const data = {
			settings,
			channel,
			target,
			type,
		};
		if (!this.Atlas.feedHandler.services[type]) {
			this.Atlas.feedHandler.services[type] = new Map();
		}
		const val = this.Atlas.feedHandler.services[type].get(key);
		if (val) {
			val.push(data);
		} else {
			this.Atlas.feedHandler.services[type].set(key, [data]);
		}

		return responder.text('feeds.add.success', type, target, channel.mention).send();
	}
};

module.exports.info = {
	name: 'add',
	guildOnly: true,
	examples: [
		'reddit #general AskReddit',
		'reddit #reddit-feeds funny',
	],
	requirements: {
		permissions: {
			user: {
				manageGuild: true,
			},
			bot: {
				manageWebhooks: true,
			},
		},
	},
};
