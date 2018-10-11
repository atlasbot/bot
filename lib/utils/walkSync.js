const FileSystem = require('fs');
const Path = require('path');

/**
 * Walks a directory but synchronous for some reason
 * @param {string} dir The absolute directory path
 * @returns {array}
 * @deprecated
 */
module.exports = dir => (FileSystem
	.statSync(dir)
	.isDirectory()
	? Array.prototype.concat(...FileSystem
		.readdirSync(dir)
		.map(f => module.exports(Path.join(dir, f))))
	: dir);
