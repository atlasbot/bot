const superagent = require('superagent');
const { version } = require('./../../package.json');

// TODO: on a reload, make this not get the data again, and just get it on demand instead so it doesn't spam the API

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

		this.userAgent = `Atlas (https://github.com/get-atlas/bot, ${version})`;
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
				.set('User-Agent', this.userAgent)
				.send(this.body);
		}
		const item = await superagent[this.method](this.url)
			.query(this.query)
			.set('Accept', 'application/json')
			.set('User-Agent', this.userAgent)
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
