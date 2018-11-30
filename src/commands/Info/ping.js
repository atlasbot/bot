const Command = require('../../structures/Command.js');

module.exports = class Ping extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const valid = this.Atlas.util.format(msg.lang, 'commands.ping.randoms');

		const rand = valid[Math.floor(Math.random() * valid.length)];

		const botMsg = await responder.text('ping.start', rand).noDupe(true).send();

		return responder
			.edit(botMsg)
			.text(msg.guild ? 'ping.server' : 'ping.dm', botMsg.timestamp - msg.timestamp)
			.send();
	}
};

module.exports.info = {
	name: 'ping',
};
