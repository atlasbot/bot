const constants = require('./constants');
const structs = require('./structures');
const schemas = require('./schemas');
const utils = require('./utils');
const emoji = require('./emoji');

const Logger = require('./Logger');

module.exports = {
	constants,
	schemas,
	structs,
	emoji,
	utils,
	logger: (override = false) => new Logger(override),
};
