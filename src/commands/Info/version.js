const Command = require('../../structures/Command.js');
const { version } = require('../../../package.json');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		return responder.text('version', version).send();
	}
};

module.exports.info = {
	name: 'version',
};
