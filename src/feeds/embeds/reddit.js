const isUri = require('./../../../lib/utils/isUri');

module.exports = (post) => {
	const embed = {
		title: `New post in ${post.subreddit_name_prefixed}`,
		url: post.url,
		description: post.title,
		thumbnail: {
			url: isUri(post.thumbnail) ? post.thumbnail : null,
		},
		footer: {
			text: `Posted by u/${post.author}`,
		},
		timestamp: new Date(),
	};

	return embed;
};
