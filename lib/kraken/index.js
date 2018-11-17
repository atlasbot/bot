const fs = require('fs');
const path = require('path');

const functions = {};

// load functions
fs.readdirSync(__dirname).filter(m => m !== 'index.js').forEach((f) => {
	functions[f.replace(/\.[^/.]+$/, '')] = require(path.join(__dirname, f));
});

module.exports = functions;
