
/*
 * !!! NOTE
 *  This whole thing is just a very rushed and quick first attempt to see what works and what doesn't.
 */

// todo: some services may not support lowercasing targets

module.exports = class FeedHandler {
	constructor(Atlas) {
		this.Atlas = Atlas;

		this.settings = {};

		this.pending = new Map();

		this.embedFormatters = {
			reddit: require('./embeds/reddit.js'),
		};

		this.fetchers = [
			{
				type: 'reddit',
				Fetcher: require('./fetchers/reddit'),
			},
		];

		this.services = {};

		this.init();
	}

	async init() {
		await this.updateList();

		for (const x of this.fetchers) {
			x.fetcher = new x.Fetcher(this.Atlas.userAgent, this);
			x.fetcher.on('chunk', post => this.onPost(x.type, post)); // eslint-disable-line no-loop-func
		}

		// update the subreddit list every 5 minutes
		setInterval(() => {
			this.updateList();
		}, 5 * 60 * 1000);
	}

	async onPost(type, posts) {
		// go through each post and chunk them into what has to be sent
		for (const post of posts) {
			const entries = this.services[type].get(post.target.toLowerCase()) || [];

			for (const data of entries) {
				const { channel, settings } = data;

				const embed = this.embedFormatters[type](post);

				if (this.pending.has(channel.id)) {
					this.pending.get(channel.id).embeds.push(embed);
				} else {
					this.pending.set(channel.id, {
						settings,
						embeds: [embed],
					});
				}
			}
		}

		// once they're all chunked up, send them in bulk
		this.sendWebhooks();
	}

	async sendWebhooks() {
		for (const channelID of this.pending.keys()) {
			const { embeds, settings } = this.pending.get(channelID);

			this.pending.delete(channelID);

			const webhook = await settings.getWebhook(channelID, 'Feeds webhook');

			if (webhook) {
				await this.Atlas.client.executeWebhook(webhook.id, webhook.token, {
					username: settings.guild.me.nick || this.Atlas.client.user.username,
					avatarURL: this.Atlas.avatar,
					embeds,
				});
			}
		}
	}

	async updateList() {
		const allSettings = (await this.Atlas.DB.Guild.find({
			id: {
				$in: this.Atlas.client.guilds.map(g => g.id),
			},
			'plugins.feeds.services': {
				$exists: true,
				// if the array is empty ignore it
				$ne: [],
			},
		})).map(s => new this.Atlas.structs.GuildSettings(s));

		const services = {
			reddit: new Map(),
		};

		for (const settings of allSettings) {
			for (const x of settings.plugin('feeds').services) {
				const { type, target } = x;
				const channel = settings.guild.channels.get(x.channel);

				if (channel) {
					const data = {
						settings,
						channel,
						target,
						type,
					};

					const key = target.toLowerCase();
					if (services[type].has(key)) {
						services[type].get(key).push(data);
					} else {
						services[type].set(key, [data]);
					}
				}
			}
		}

		this.services = services;
	}
};
