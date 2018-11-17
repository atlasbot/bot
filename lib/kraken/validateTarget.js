const fetchYouTube = require('./fetchYouTube');
const fetchReddit = require('./fetchReddit');
const fetchTwitch = require('./fetchTwitch');

/**
 * Validates that a target is valid and returns an ID/name that Kraken will be gucci with.
 * @param {string} type The type of target to validate.
 * @param {string} target The target to validate
 * @param {string} ytToken The YouTube Data API token to use when validating channels.
 * @returns {Promise<boolean|string>} False if the target is invalid, a string with the target name otherwise.
 */
module.exports = async (type, target, ytToken = process.env.YOUTUBE_KEY) => {
	if (!target) {
		return false;
	}

	if (type === 'reddit') {
		const clean = await fetchReddit(target, true);

		if (clean) {
			return {
				name: `r/${clean}`,
				target: clean,
			};
		}
	} else if (type === 'youtube') {
		const channel = await fetchYouTube(target, ytToken);

		if (channel) {
			return {
				name: channel.snippet.title,
				target: channel.id.channelId,
			};
		}
	} else if (type === 'twitch') {
		const clean = await fetchTwitch(target, undefined, true);

		if (clean) {
			return {
				name: clean,
				target: clean,
			};
		}
	}

	return false;
};
