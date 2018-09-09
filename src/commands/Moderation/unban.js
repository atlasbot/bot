const Command = require('../../structures/Command.js');

module.exports = class Unban extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// TODO: add ban to guild event thingy in guild struct and handle logging from here instead of action log
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('unban.noArgs').send();
		}
		const query = args.shift();
		let target = await settings.findMember(query);

		let bans;
		if (!target) {
			bans = await msg.guild.getBans();
			target = await settings.findMember(query, {
				members: bans.map(b => b.user),
			});
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		}

		try {
			await msg.guild.unbanMember(target.id, args.join(' '));

			return responder.text('unban.success', target.tag).send();
		} catch (e) {
			return responder.error('unban.error', target.tag).send();
		}
	}
};

module.exports.info = {
	name: 'unban',
	usage: 'info.unban.usage',
	description: 'info.unban.description',
	examples: [
		'@random cus ur being nice now',
		'111372124383428608 ur too cool to ban',
	],
	requirements: {
		permissions: {
			user: {
				banMembers: true,
			},
			bot: {
				banMembers: true,
			},
		},
	},
	guildOnly: true,
};
