const FileSystem = require('fs');
const Path = require('path');

module.exports = dir => (FileSystem
	.statSync(dir)
	.isDirectory()
	? Array.prototype.concat(...FileSystem
		.readdirSync(dir)
		.map(f => module.exports(Path.join(dir, f))))
	: dir);
