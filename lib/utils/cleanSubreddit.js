/**
 * Removes a subreddit prefix (if any), e.g r/AskReddit > AskReddit or grabs the subreddit from a URL
 * @param {string} sub The subreddit name, e.g AskReddit, r/AskReddit or /r/AskReddit
 * @returns {string} the sub name, e.g AskReddit
 */
module.exports = (sub) => {
	const re = /(?:(?:http|https):\/\/|)(?:www\.|)reddit\.com\/r\/([a-zA-Z0-9-]{1,})/;
	if (re.test(sub)) {
		[, sub] = re.exec(sub);
	}

	return sub.replace(/\/?r\/(.*)/, (i, match) => match);
};
