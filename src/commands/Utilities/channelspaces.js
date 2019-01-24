const Command = require('../../structures/Command.js');

const SPACE = '\u2009\u2009\u2009';

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'channelspaces');

		let channel;
		if (args.length) {
			channel = await settings.findRoleOrChannel(args.join(' '), {
				type: 'channel',
			});
		} else {
			({ channel } = msg);
		}

		if (!channel) {
			return responder.error('noChannel', args.join(' ')).send();
		}

		try {
			if (channel.name.includes('-')) {
				await channel.edit({
					name: channel.name.split('-').join(SPACE),
				});
			}

			return responder.text('success', channel.mention).send();
		} catch (e) {
			return responder.error('error').send();
		}
	}
};

module.exports.info = {
	name: 'channelspaces',
	aliases: ['channelspace'],
	examples: [
		'',
		'#channel',
	],
	permissions: {
		bot: {
			manageChannels: true,
		},
		user: {
			manageChannels: true,
		},
	},
};
