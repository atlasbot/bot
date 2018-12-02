const { Member } = require('eris');
const Command = require('../../structures/Command.js');


module.exports = class Ban extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
		fun = false,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('ban.noArgs').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query);

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		if (target instanceof Member) {
			if (!target.punishable(msg.member)) {
				return responder.error('general.notPunishable').send();
			} if (!target.bannable) {
				return responder.error('general.lolno').send();
			}
		}

		try {
			const ban = await this.Atlas.client.getGuildBan(msg.guild.id, target.id);
			if (ban) {
				if (ban.reason) {
					return responder.error('ban.tooLateReason', ban.reason, target.tag).send();
				}

				return responder.error('ban.tooLate', target.tag).send();
			}
		} catch (e) {} // eslint-disable-line no-empty

		try {
			// try to tell the user who banned them, why and that they're a bad person
			const channel = await (target.user || target).getDMChannel();

			responder.channel(channel);

			if (args[0]) {
				responder.text('ban.feelsGoodMan.reason', msg.guild.name, args.join(' '), msg.author.tag, msg.author.id);
			} else {
				responder.text('ban.feelsGoodMan.noReason', msg.guild.name, msg.author.tag, msg.author.id);
			}

			await responder.send();
		} catch (e) {} // eslint-disable-line no-empty

		this.Atlas.auditOverrides.push({
			type: 22,
			date: new Date(),
			user: msg.author,
			userID: msg.author.id,
			targetID: target.id,
			target,
			reason: args.join(' '),
			guild: msg.guild.id,
		});

		await msg.guild.banMember(target.id, 0, `Banned by ${msg.author.tag} ${args[0] ? `with reason "${args.join(' ')}"` : ''}`);

		if (fun) {
			return responder.embed({
				author: {
					icon_url: target.avatarURL,
					name: ['funban.success', target.tag],
				},
				image: {
					url: 'https://thumbs.gfycat.com/TidyBonyAlligatorgar-small.gif',
				},
				timestamp: new Date(),
			}).send();
		}

		if (args[0]) {
			return responder.text('ban.withReason', target.tag, args.join(' ')).send();
		}

		return responder.text('ban.success', target.tag).send();
	}
};

module.exports.info = {
	name: 'ban',
	examples: [
		'@random breaking the rulez',
		'@random not partying hard enough',
		`${process.env.OWNER} being too cool`,
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
