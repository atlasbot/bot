const constants = require('./constants');
const structs = require('./structures');
const schemas = require('./schemas');
const emojis = require('./emojis');
const utils = require('./utils');

const Logger = require('./Logger');

module.exports = {
	constants,
	schemas,
	structs,
	emojis,
	utils,
	logger: (override = false) => new Logger(override),
};
