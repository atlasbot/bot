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
			return responder.error('unban.noArgs').send();
		}

		const query = args.shift();
		let target = await settings.findMember(query);

		if (!target) {
			// fixme: this could be an issue on servers with >500 bans, apples to all occurences of it
			const bans = await msg.guild.getBans();
			target = await settings.findMember(query, {
				members: bans.map(b => b.user),
			});
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		}

		this.Atlas.auditOverrides.push({
			type: 23,
			date: new Date(),
			user: msg.author,
			userID: msg.author.id,
			targetID: target.id,
			reason: args.join(' '),
			guild: msg.guild.id,
			target,
		});

		await msg.guild.unbanMember(target.id, `Unbanned by ${msg.author.tag} ${args[0] ? `with reason "${args.join(' ')}"` : ''}`);

		return responder.text('unban.success', target.tag).send();
	}
};

module.exports.info = {
	name: 'unban',
	examples: [
		'@random because you\'re being nice now',
		`${process.env.OWNER} too cool to ban :^)`,
	],
	permissions: {
		user: {
			banMembers: true,
		},
		bot: {
			banMembers: true,
		},
	},
	guildOnly: true,
};
