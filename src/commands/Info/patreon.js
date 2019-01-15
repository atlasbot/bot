const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.text('patreon').send();
	}
};

module.exports.info = {
	name: 'patreon',
	aliases: [
		'donate',
		'patron',
		'pledge',
	],
};
