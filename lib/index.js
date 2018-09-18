const Settings = require('./structures/Settings');
const Database = require('./structures/Database');

const schemas = require('./schemas');
const utils = require('./utils');
const emojis = require('./emojis');


module.exports = {
	schemas,
	structs: {
		Database,
		Settings,
	},
	emojis,
	utils,
};
