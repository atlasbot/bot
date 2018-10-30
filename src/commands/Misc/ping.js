const Command = require('../../structures/Command.js');

module.exports = class Ping extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		// todo: why is this doing this weird shit
		const locale = { ...this.Atlas.langs.get(process.env.DEFAULT_LANG), ...this.Atlas.langs.get(msg.lang) };

		const valid = locale.commands.ping.randoms;
		const rand = locale.commands.ping.randoms[Math.floor(Math.random() * valid.length)];

		responder.text('ping.start', rand).noDupe(true).send()
			.then((botMsg) => {
				responder
					.edit(botMsg)
					.text(msg.guild ? 'ping.server' : 'ping.dm', botMsg.timestamp - msg.timestamp)
					.send();
			});
	}
};

module.exports.info = {
	name: 'ping',
};
