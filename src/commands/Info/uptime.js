const Command = require('../../structures/Command.js');

module.exports = class Uptime extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const time = this.Atlas.lib.utils.prettyMs(this.Atlas.client.uptime, {
			verbose: true,
		});

		return responder.text('uptime', time).send();
	}
};

module.exports.info = {
	name: 'uptime',
};
