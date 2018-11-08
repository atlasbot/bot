const Command = require('../../structures/Command.js');


module.exports = class Kick extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// TODO: DM the user why they were banned
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('kick.noArgs').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query, {
			memberOnly: true,
		});

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		// todo: all occures of this mess should be replaced with proper checks
		if (!target.punishable(msg.member)) {
			return responder.error('general.notPunishable').send();
		} if (!target.punishable(msg.guild.me)) {
			return responder.error('general.lolno').send();
		}

		this.Atlas.auditOverrides.push({
			type: 20,
			date: new Date(),
			reason: args.join(' '),
			user: msg.author,
			userID: msg.author.id,
			guild: msg.guild.id,
			targetID: target.id,
			target,
		});

		await msg.guild.kickMember(target.id, `Kicked by ${msg.author.tag} ${args[0] ? `with reason "${args.join(' ')}"` : ''}`);

		if (args[0]) {
			return responder.text('kick.withReason', target.tag, args.join(' ')).send();
		}

		return responder.text('kick.success', target.tag).send();
	}
};

module.exports.info = {
	name: 'kick',
	examples: [
		'@random breaking the rulez',
		'@random not partying hard enough',
		`${process.env.OWNER} being too cool`,
	],
	permissions: {
		user: {
			kickMembers: true,
		},
		bot: {
			kickMembers: true,
		},
	},
	guildOnly: true,
};
