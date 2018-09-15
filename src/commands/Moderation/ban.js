const { Member } = require('eris');
const superagent = require('superagent');
const Command = require('../../structures/Command.js');
// const util = require('util');

module.exports = class Ban extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// TODO: add ban to guild event thingy in guild struct and handle logging from here instead of action log
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('ban.noArgs').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query);

		if (!target) {
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		}

		if (target instanceof Member) {
			// todo: member.bannable check & member.kickable for kick but it's not done yet so hopefully i see this before i make it lmao
			if (!target.punishable(msg.member)) {
				return responder.error('general.notPunishable');
			} if (!target.punishable(msg.guild.me)) {
				return responder.error('general.lolno').send();
			}
		}

		const ban = await this.getBan(msg.guild.id, target.id);
		if (ban) {
			if (ban.reason) {
				return responder.error('ban.tooLateReason', ban.reason, target.tag).send();
			}

			return responder.error('ban.tooLate', target.tag).send();
		}

		msg.guild.banMember(target.id, 0, args.join(' '))
			.then(() => {
				if (args[0]) {
					responder.text('ban.withReason', target.tag, args.join(' ')).send();
				} else {
					responder.text('ban.success', target.tag).send();
				}
			})
			.catch(() => responder.error('ban.error', target.tag).send());
	}

	// Eris' Client#getGuildBan() is undefined for *some reason* so this will work fine for now
	// todo
	async getBan(guildID, userID) {
		try {
			return (await superagent.get(`https://discordapp.com/api/guilds/${guildID}/bans/${userID}`)
				.set({
					'User-Agent': `Atlas (https://get-atlas.xyz/, v${this.Atlas.version})`,
					Authorization: this.Atlas.client.token,
				})).body;
		} catch (e) {
			return null;
		}
	}
};

module.exports.info = {
	name: 'ban',
	usage: 'info.ban.usage',
	description: 'info.ban.description',
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
