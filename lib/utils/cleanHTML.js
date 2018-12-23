const stripEntities = require('./stripEntities');

/**
 * Cleans HTML, removing tags and replacing entities. **DO NOT USE FOR SANITIZATION!** This is only for cleaning API responses, for the most part.
 * @param {String} str The string to clean
 * @param {Boolean} [markdown=true] Whether to convert some elements to Discord flavoured markdown.
 * @returns {String} The cleaned string
 */

module.exports = (str, markdown = true) => {
	if (markdown) {
		str = str.replace(/<a.*?href="(.*?)".*?>([^<]+)<\/a>/gi, '[$2]($1)');
	}


	return stripEntities(str.replace(/<\/?[^>]+(?:>|$)/g, ''));
};
