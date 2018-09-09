const superagent = require('superagent');

module.exports = class Prefetcher {
	constructor({
		url,
		method = 'get',
		body = {},
		query = {},
		amount = 3,
	}) {
		this.url = url;
		this.method = method;
		this.body = body;
		this.query = query;
		this.amount = amount;

		this.cache = [];
	}

	/**
	 * Gets a result
	 * @returns {Object} the data that it got
	 */
	async get() {
		let item;

		if (this.cache[0]) {
			item = this.cache.shift();
		} else {
			item = await this.fetch(false);
		}

		this.fetch(true).catch(() => null);
		if (!item) {
			throw new Error('No item to return');
		}

		return item;
	}

	/**
	 * Fetches items from the API and pushes them to the cache
	 * @param {boolean} prefetch whether or not to get an item from the cache or fetch a new one
	 * @returns {Promise<void>} void
	 */
	async fetch(prefetch = true) {
		if (!prefetch) {
			return superagent[this.method](this.url)
				.query(this.query)
				.set('Accept', 'application/json')
				.send(this.body);
		}
		const item = await superagent[this.method](this.url)
			.query(this.query)
			.set('Accept', 'application/json')
			.send(this.body);
		this.cache.push(item);
	}

	/**
	 * starts the prefetcher
	 * @returns {void}
	 */
	async init() {
		for (let i = 0; i < this.amount; i++) {
			try {
				await this.fetch();
			} catch (e) {
				console.error(`Prefetcher ran into an issue, pausing... ${e}`);
				break;
			}
		}
	}
};
