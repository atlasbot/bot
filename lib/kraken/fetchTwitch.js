const superagent = require('superagent');

/**
 * Fetches info about a Twitch channel or checks for it's existence.
 * @param {string} query The twitch url/username to check for
 * @param {string} twitchClientID The twitch client ID to use
 * @param {boolean} checkOnly Whether to use a HEAD request and check the status for 404 or do a full GET request.
 * @returns {Promise<Object|boolean|void>}
 */
module.exports = async (query, twitchClientID = process.env.TWITCH_CLIENT_ID, checkOnly = false) => {
	const re = /(?:(?:http|https):\/\/|)(?:www\.|)twitch\.tv\/([a-zA-Z0-9-]{1,})/;
	if (re.test(query)) {
		[, query] = re.exec(query);
	}

	try {
		const method = checkOnly ? 'head' : 'get';
		const { body } = await superagent[method](`https://api.twitch.tv/kraken/channels/${query}`)
			.set('Client-ID', twitchClientID);

		if (checkOnly) {
			return query;
		}

		return body;
	} catch (e) {
		if (e.status === 404) {
			return;
		}

		console.log(e.response, e.response.body || e.response.text);

		throw e;
	}
};
