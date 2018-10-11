/**
 * Removes a subreddit prefix (if any), e.g r/AskReddit > AskReddit
 * @param {string} sub The subreddit name, e.g AskReddit, r/AskReddit or /r/AskReddit
 * @returns {string} the sub name, e.g AskReddit
 */
module.exports = sub => sub.replace(/\/?r\/(.*)/, (i, match) => match);
