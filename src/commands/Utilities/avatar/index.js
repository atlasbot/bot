const Command = require('../../../structures/Command.js');

module.exports = class Avatar extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		let target;
		if (args[0]) {
			target = await this.Atlas.util.findMember(msg.guild, args.join(' '));

			if (!target) {
				return responder.error('avatar.base.cannotFind', args.join(' ')).send();
			}
		} else {
			target = msg.author;
		}

		const avatar = target.avatar || target.defaultAvatar;
		const url = size => `https://cdn.discordapp.com/avatars/${target.id}/${avatar}?size=${size}`;

		return responder.embed({
			title: 'avatar.base.title',
			url: url(1024),
			image: {
				url: url(128),
			},
		}).send();
	}
};

module.exports.info = {
	name: 'avatar',
	aliases: [
		'icon',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
