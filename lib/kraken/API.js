const superagent = require('superagent');
const qs = require('querystring');

const Endpoints = {
	TYPES: '/types',
	CREATE_GUILD_FEED: '/feed',
	GET_FEED: (type, target) => `/feed?${qs.stringify({
		type,
		target,
	})}`,
	DELETE_FEED: (type, target, guild) => `/feed?${qs.stringify({
		type,
		target,
		guild,
	})}`,
	GET_FEEDS_GUILD: guild => `/feeds?${qs.stringify({
		guild,
	})}`,
	GET_FEEDS_GUILD_COUNT: guild => `/feeds/count?${qs.stringify({
		guild,
	})}`,
};

/** a tiny thing to interact with kraken because i wanted to procrastinate for a few minutes */
module.exports = class {
	/**
	 * this is pretty self explanatory right?
	 * @param {string} token The auth token to use.
	 * @param {Object} options more options
	 * @param {string|number} options.port The port kraken is on
	 * @param {string} options.host The host kraken is at
	 */
	constructor(token, {
		host,
		port,
	}) {
		this.token = token;

		this.host = host;
		this.port = port;
	}

	/**
	 * Merges the host and port. idk why they're seperated in the first place.
	 * @returns {string}
	 * @private
	 */
	get url() {
		return `${this.host}:${this.port}`;
	}

	/**
	 * Gets all valid types.
	 * @returns {Promise<Array<string>>}
	 * @throws
	 */
	getTypes() {
		return this._request('get', Endpoints.TYPES);
	}

	/**
	 * Gets a full feed, including all the guilds that are listening for it.
	 * @param {string} type The type of feed. See api#getTypes for an array of all valid types.
	 * @param {string} target The target URL. If it's a YouTube channel, it's the channel ID. Subreddit, it's the subreddit name. Etc...
	 * @returns {Promise<Object>}
	 * @throws
	 */
	getFeed(type, target) {
		return this._request('get', Endpoints.GET_FEED(type, target));
	}

	/**
	 * Create a feed for a guild.
	 * @param {Object} body options
	 * @param {string} body.type A feed type, e.g "rss". use api#getTypes to get all valid types.
	 * @param {target} body.target A target, if it's a subreddit it would be the subreddit name, if it's a YouTube channel it would be the channel ID, etc...
	 * @param {string} body.guild The ID of the guild that will recieve the request.
	 * @param {string} body.channel The ID of the channel to send data to, used more or less exlusively to renew webhooks if they're deleted.
	 * @param {boolean} body.allowNSFW Whether NSFW posts will be allowed.
	 * @param {Object} body.webhook The webhook to use, set to null/undefined if you want one created by Kraken.
	 * @param {string} body.webhook.id The ID of the webhook
	 * @param {string} body.webhook.token The token of the webhook
	 * @returns {Promise<Object>}
	 * @throws
	 */
	createGuildFeed(body) {
		return this._request('post', Endpoints.CREATE_GUILD_FEED, body);
	}

	/**
	 * Delete a guilds feed.
	 * @param {string} type The type. see API#getTypes
	 * @param {string} target The target. See another jsdoc thing for it idk
	 * @param {string} guild The guild ID to delete the feed from
	 * @returns {Promise<Object>}
	 * @throws
	 */
	deleteGuildFeed(type, target, guild) {
		return this._request('delete', Endpoints.DELETE_FEED(type, target, guild));
	}

	/**
	 * Gets a guilds feeds.
	 * @param {string} guild The ID of the guild to get feeds of.
	 * @returns {Promise<Array<Object>>}
	 * @throws
	 */
	getGuildFeeds(guild) {
		return this._request('get', Endpoints.GET_FEEDS_GUILD(guild));
	}

	/**
	 * Gets how many feeds the guild has.
	 * @param {string} guild The ID of the guild to get the feed count of.
	 * @returns {Promise<number>}
	 * @throws
	 */
	async getGuildFeedCount(guild) {
		const { listeningFor } = await this._request('get', Endpoints.GET_FEEDS_GUILD_COUNT(guild));

		return listeningFor;
	}

	/**
	 * essentially a wrapper for superagent lol
	 * @param {string} method The method, one of "GET", "POST", "PUT", "HEAD", etc...
	 * @param {string} endpoint The endpoint from Endpoints, e.g, '/feed'
	 * @param {Object} payload Something to send if it's a post request.
 	 * @param {Object} queryParams Query params.
	 * @throws if the request failed (status wasn't 200)
	 * @returns {Promise<Object>} The request body.
	 * @private
	 */
	async _request(method, endpoint, payload, queryParams) {
		const url = `${this.url}${endpoint}`;

		const { body } = await superagent[method](url)
			.set('Authorization', this.token)
			.query(queryParams)
			.send(payload);

		return body;
	}
};

module.exports.Endpoints = Endpoints;
