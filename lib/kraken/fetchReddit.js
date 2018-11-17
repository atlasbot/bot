const superagent = require('superagent');
const cleanSubreddit = require('../utils/cleanSubreddit');

// i love reddit solely because they don't need api tokens
/**
 * Fetches information about a subreddit, if it exists.
 * @param {string} query The subreddit name, url, etc..
 * @param {boolean} checkOnly Whether to use a HEAD request and check the status for 404 or do a full GET request.
 * @returns {Promise<Object|boolean|void>}
 */
module.exports = async (query, checkOnly = false) => {
	const clean = cleanSubreddit(query);

	try {
		const method = checkOnly ? 'head' : 'get';
		// checking /about vs the subreddit's actual page also means r/all and subs like it are invalid
		// which kraken shouldn't really check or update servers on because it updates too often
		const { body } = await superagent[method](`https://www.reddit.com/r/${clean}/about.json?raw_json=1`);

		if (checkOnly) {
			return clean;
		}

		return body.data;
	} catch (e) {
		if ([301, 302, 404].includes(e.status)) {
			return;
		}

		throw e;
	}
};
