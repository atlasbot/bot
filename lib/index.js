const constants = require('./constants');
const structs = require('./structures');
const schemas = require('./schemas');
const utils = require('./utils');
const emoji = require('./emoji');
const xputil = require('./xputil');

const Logger = require('./Logger');

module.exports = {
	constants,
	schemas,
	structs,
	emoji,
	utils,
	xputil,
	logger: (override = false) => new Logger(override),
};
