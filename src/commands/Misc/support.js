const Command = require('../../structures/Command.js');

module.exports = class Support extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.text('support').send();
	}
};

module.exports.info = {
	name: 'support',
	description: 'info.support.description',
};
