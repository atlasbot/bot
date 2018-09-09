const Settings = require('./structures/Settings');
const Database = require('./structures/Database');
const Snowflake = require('./structures/Snowflake');

const schemas = require('./schemas');
const utils = require('./utils');
const emojis = require('./emojis');


module.exports = {
	schemas,
	structs: {
		Database,
		Settings,
		Snowflake,
	},
	emojis,
	utils,
};
