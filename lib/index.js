const constants = require('./constants');
const structs = require('./structures');
const schemas = require('./schemas');
const kraken = require('./kraken');
const utils = require('./utils');
const emoji = require('./emoji');

const Logger = require('./Logger');

module.exports = {
	constants,
	schemas,
	structs,
	emoji,
	kraken,
	utils,
	logger: (override = false) => new Logger(override),
};
