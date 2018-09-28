const { Member } = require('eris');
const Command = require('../../structures/Command.js');


module.exports = class FunBan extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// TODO: DM the user why they were banned
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('funban.noArgs').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query);

		if (!target) {
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		}

		if (target instanceof Member) {
			if (!target.punishable(msg.member)) {
				return responder.error('general.notPunishable').send();
			} if (!target.punishable(msg.guild.me)) {
				return responder.error('general.lolno').send();
			}
		}

		try {
			const ban = await this.Atlas.client.getGuildBan(msg.guild.id, target.id);
			if (ban) {
				if (ban.reason) {
					return responder.error('funban.tooLateReason', ban.reason, target.tag).send();
				}

				return responder.error('funban.tooLate', target.tag).send();
			}
		} catch (e) {} // eslint-disable-line no-empty

		try {
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

			await msg.guild.banMember(target.id, 0, args.join(' '));

			return responder.embed({
				author: {
					icon_url: target.avatarURL || target.defaultAvatarURL,
					name: ['funban.success', target.tag],
				},
				image: {
					url: 'https://thumbs.gfycat.com/TidyBonyAlligatorgar-small.gif',
				},
				timestamp: new Date(),
			}).send();
		} catch (e) {
			return responder.error('funban.error', target.tag).send();
		}
	}
};

module.exports.info = {
	name: 'funban',
	usage: 'info.funban.usage',
	description: 'info.funban.description',
	examples: [
		'@random breaking the rulez',
		'@random not partying hard enough',
		`${process.env.OWNER} being too cool`,
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
