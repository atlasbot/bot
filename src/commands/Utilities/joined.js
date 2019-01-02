const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('joined.noArgs').send();
		}

		const user = await settings.findMember(args.join(' '), {
			memberOnly: true,
		});

		if (!user) {
			return responder.error('joined.noUser', args.join(' ')).send();
		}

		return responder.text(
			'joined.message',
			user.mention,
			msg.guild.name,
			new Date(user.joinedAt).toLocaleString(),
		).send();
	}
};

module.exports.info = {
	name: 'joined',
	examples: [
		'@user',
		'111372124383428608',
	],
	guildOnly: true,
};
