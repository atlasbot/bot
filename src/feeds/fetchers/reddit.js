const superagent = require('superagent');

const LIMIT = 100;
const POLL_INTERVAL = 10000;
const BACKTRACK_POLL_INTERVAL = 2000;

let EventEmitter;
try {
	EventEmitter = require('eventemitter3');
} catch (e) {
	EventEmitter = require('events').EventEmitter; // eslint-disable-line prefer-destructuring
}

module.exports = class RedditStream extends EventEmitter {
	constructor(userAgent) {
		super();
		this.userAgent = userAgent;

		// start the loop
		this.getItems();
	}

	async getItems(newest, lastNewest, after, isBacktracking = false) {
		const { body } = await superagent.get('https://reddit.com/r/all/new.json')
			.query({
				raw_json: 1,
				limit: LIMIT,
				after,
			})
			.set('User-Agent', this.userAgent);

		const items = body.data.children;

		const newItems = [];

		if (items.length > 0) {
			for (const item of Array.from(items)) {
				if (isBacktracking) {
					if (item.data.name <= lastNewest) {
						break;
					}
				} else if (item.data.name <= newest) {
					break;
				}
				newItems.push(item);
			}

			if ((items[0].data.name > newest) && !isBacktracking) {
				lastNewest = newest;
				newest = items[0].data.name;
			}

			after = items[items.length - 1].data.name;
		}

		if (newItems.length > 0) {
			const chunk = newItems.map((p) => {
				p.data.target = p.data.subreddit;

				return p.data;
			});

			chunk.forEach((i) => {
				this.emit('post', i);
			});

			this.emit('chunk', chunk);
		}

		let shouldBacktrack = newItems.length === items.length;

		if (!lastNewest || (items.length >= 0 && items.length < LIMIT)) {
			shouldBacktrack = false;
		}

		if (isBacktracking && shouldBacktrack) {
			setTimeout(() => {
				this.getItems(newest, lastNewest, after, true);
			}, BACKTRACK_POLL_INTERVAL);
		} else if (shouldBacktrack) {
			this.getItems(newest, lastNewest, after, true);
		}

		return setTimeout(() => {
			this.getItems(newest, lastNewest);
		}, POLL_INTERVAL);
	}
};
