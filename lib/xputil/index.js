const emojis = require('emojilib').lib;
const fs = require('fs');
const path = require('path');

module.exports = emojis;

// load functions
fs.readdirSync(__dirname).filter(m => m !== 'index.js').forEach((f) => {
	module.exports[f.replace(/\.[^/.]+$/, '')] = require(path.join(__dirname, f));
});
