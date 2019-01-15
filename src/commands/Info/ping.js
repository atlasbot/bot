const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const valid = this.Atlas.util.format(msg.lang, 'commands.ping.randoms');

		const rand = valid[Math.floor(Math.random() * valid.length)];

		const botMsg = await responder.text('ping.start', rand).noDupe(true).send();

		return responder
			.edit(botMsg)
			.text('ping.server', Math.abs(botMsg.timestamp - msg.timestamp), msg.guild.shard.latency)
			.send();
	}
};

module.exports.info = {
	name: 'ping',
};
