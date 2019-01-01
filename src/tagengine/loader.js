const path = require('path');
const walkSync = require('./../../lib/utils/walkSync');

/**
 * Loads tags from the tag directory into a nice phat map
 * @returns {Map<Object>} The valid tags
 */
module.exports = () => {
	const files = walkSync(path.join(__dirname, '/tags'));

	const tags = new Map();

	for (const file of files.filter(f => !f.startsWith('-') && !f.endsWith('middleware.js'))) {
		const tag = require(file);

		const data = {
			info: tag.info,
			execute: tag,
		};

		if (tag.info.aliases) {
			tag.info.aliases.map(a => tags.set(a, data));
		}

		tags.set(tag.info.name, data);
	}

	console.log(`Loaded ${tags.size} tags`);

	return tags;
};
