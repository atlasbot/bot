const fs = require('fs').promises;
const path = require('path');

/**
 * Walks a directory async style
 * @param {string} dir The absolute path to the file
 * @returns {Promise<array>}
 */
module.exports = async (dir) => {
	const files = await fs.readdir(dir);
	const checked = [];

	for (const file of files) {
		const loc = path.join(dir, file);
		const stat = await fs.stat(loc);

		if (stat.isDirectory()) {
			checked.push(...await module.exports(loc));
		} else {
			checked.push(loc);
		}
	}
};
