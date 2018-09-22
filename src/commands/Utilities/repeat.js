const Command = require('../../structures/Command.js');

const tokens = [];
Object.keys(process.env).forEach((k) => {
	if (k.toLowerCase().includes('token') && process.env[k].length > 5) {
		tokens.push({
			name: k,
			value: process.env[k],
		});
	}
});

module.exports = class Repeat extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).localised(true).noDupe(false);
		if (msg.author.id !== process.env.OWNER) {
			return responder.error('no u').send();
		}

		const time = Number(args.shift());
		if (isNaN(time)) {
			return responder.error('Repeat amount must be set.').send();
		}
		if (!args[0]) {
			return responder.error('You have to have something to repeat.').send();
		}

		const fakeMsg = new this.Atlas.structs.FakeMessage({
			channelID: msg.channel.id,
			author: msg.author,
			lang: msg.lang,
			content: args.join(' '),
		});

		for (let i = 0; i < time; i++) {
			this.Atlas.client.emit('messageCreate', fakeMsg.get());
		}
	}
};

module.exports.info = {
	name: 'repeat',
	localised: true,
	hidden: true,
};
