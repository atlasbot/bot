const Prefetcher = require('./Prefetcher');
const isUri = require('./../utils/isUri');
const pickOne = require('./../utils/pickOne');

module.exports = class Reddit {
	constructor(subreddit, {
		prefetch = true,
		sort = 'top',
		minUps = 5,
	} = {}) {
		this.sort = sort;
		this.prefetch = prefetch;
		this.minUps = minUps;
		this.subreddits = Array.isArray(subreddit) ? subreddit : [subreddit];

		this.cache = {};
		for (const sub of this.subreddits) {
			this.cache[sub] = new Prefetcher({
				url: `https://old.reddit.com/r/${sub}/.json`,
				query: {
					sort,
					raw_json: 1,
				},
				amount: prefetch === true ? 1 : 0,
			});
			this.cache[sub].init();
		}
		this.seenMap = new Map();
		this.lastIndex = 0;
	}

	async getPosts(id) {
		this.lastIndex = this.lastIndex + 1;
		const possible = Object.keys(this.cache);

		let sub;
		if (possible[this.lastIndex]) {
			sub = possible[this.lastIndex];
		} else {
			this.lastIndex = 0;
			sub = possible[this.lastIndex];
		}

		const prefetcher = this.cache[sub];
		const { body } = await prefetcher.get();

		let posts = body.data.children
			.map(p => p.data)
			.filter(p => !p.is_self && p.preview && p.preview.images && !isUri(p.title) && p.ups > this.minUps);

		posts.forEach((post) => {
			if (!this.seenMap.has(post.id)) {
				this.seenMap.set(post.id, []);
			}
		});

		const filtered = posts.filter(p => !this.seenMap.get(p.id).includes(id));
		if (filtered[0]) {
			posts = filtered;
		}

		return posts;
	}

	async getImage(id) {
		const posts = await this.getPosts(id);

		if (!posts[0]) {
			throw new Error('No posts to choose from.');
		}

		const post = pickOne(posts);

		const { url } = post.preview.images[0].source;

		return {
			id: post.id,
			thumbnail: post.thumbnail,
			image: url,
			nsfw: post.over_18,
			author: post.author,
			subreddit: post.subreddit,
			embed: {
				title: post.title.substring(0, 256),
				image: {
					url,
				},
				url: `https://old.reddit.com${post.permalink}`,
				footer: {
					text: `Submitted to reddit.com/r/${post.subreddit} by ${post.author}`,
				},
				timestamp: new Date(),
			},
		};
	}
};
