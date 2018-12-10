const swearjar = require('swearjar');
const Command = require('../../structures/Command.js');

module.exports = class Say extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'say');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const channel = await settings.findRoleOrChannel(args[0], {
			type: 'channel',
			fuzzy: false,
		});

		if (channel) {
			args.shift();

			responder.channel(channel);
		}

		responder.localised();

		let text = args.join(' ');

		if (msg.member && !msg.member.permission.has('manageMessages')) {
			text = swearjar.censor(text, '\\*');

			const botMsg = await responder.text(text).send();

			// deletes the message if the user who did "a!say"
			return this.Atlas.deleteAliases.set(msg.id, {
				msg: botMsg.id,
				channel: channel ? channel.id : msg.channel.id,
			});
		}

		return responder.text(text).send();
	}
};

module.exports.info = {
	name: 'say',
	aliases: ['rinfo'],
	examples: [
		'wew',
	],
};
