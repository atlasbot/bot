const Command = require('../../structures/Command.js');

module.exports = class Invite extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.text('invite').send();
	}
};

module.exports.info = {
	name: 'invite',
};
