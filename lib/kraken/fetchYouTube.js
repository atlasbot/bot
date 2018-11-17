const superagent = require('superagent');

/**
 * Gets information about a YouTube channel.
 * @param {string} query The search. Can be a URL, channel name, channel ID, etc...
 * @param {string} [ytToken=process.env.YOUTUBE_KEY] The token to use for YouTube's Data API.
 * @returns {Promise<void|Object>} The channel.
 */
module.exports = async (query, ytToken = process.env.YOUTUBE_KEY) => {
	const re = /(?:(?:http|https):\/\/|)(?:www\.|)youtube\.com\/(?:channel\/|user\/)([a-zA-Z0-9-]{1,})/;
	if (re.test(query)) {
		[, query] = re.exec(query);
	}

	const { body } = await superagent.get('https://www.googleapis.com/youtube/v3/search')
		.query({
			part: 'id,snippet',
			key: ytToken,
			maxResults: 1,
			q: query,
			type: 'channel',
		});

	if (body.items.length) {
		return body.items[0];
	}
};
