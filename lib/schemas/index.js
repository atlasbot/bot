const fs = require('fs');
const path = require('path');

const schemas = {};

// load schemas
fs.readdirSync(__dirname).filter(m => m !== 'index.js').forEach((f) => {
	schemas[`${f.replace(/\.[^/.]+$/, '')}Schema`] = require(path.join(__dirname, f));
});

module.exports = schemas;
