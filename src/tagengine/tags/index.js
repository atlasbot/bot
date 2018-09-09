const fs = require('fs');
const path = require('path');

const tags = {};

// load schemas
fs.readdirSync(__dirname).filter(m => m !== 'index.js').forEach((f) => {
	tags[f.replace(/\.[^/.]+$/, '')] = require(path.join(__dirname, f));
});

module.exports = tags;
