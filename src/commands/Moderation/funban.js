const { Member } = require('eris');
const superagent = require('superagent');
const Command = require('../../structures/Command.js');
// const util = require('util');

module.exports = class FunBan extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// TODO: add ban to guild event thingy in guild struct and handle logging from here instead of action log
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
				return responder.error('general.notPunishable');
			} if (!target.punishable(msg.guild.me)) {
				return responder.error('general.lolno').send();
			}
		}

		const ban = await this.getBan(msg.guild.id, target.id);
		if (ban) {
			if (ban.reason) {
				return responder.error('funban.tooLateReason', ban.reason, target.tag).send();
			}

			return responder.error('funban.tooLate', target.tag).send();
		}

		try {
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
