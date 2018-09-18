const fs = require('fs');
const path = require('path');

const structs = {};

fs.readdirSync(__dirname).filter(m => m !== 'index.js').forEach((f) => {
	structs[f.replace(/\.[^/.]+$/, '')] = require(path.join(__dirname, f));
});

module.exports = structs;
