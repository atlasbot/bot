const Command = require('../../structures/Command.js');

// todo: this command is inefficient, the whole user profile system is actually

module.exports = class Level extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'level');

		let user = msg.author;
		if (args[0]) {
			const query = args.join(' ');

			user = await settings.findMember(query, {
				memberOnly: true,
			});

			if (!user) {
				return responder.error('invalidUser', query).send();
			}
		}

		// findMember should generate the profile if it doesn't exist anyway
		const player = await this.Atlas.DB.getProfile(user.id);

		if (!player) {
			return responder.error('noProfile').send();
		}

		const guildProfile = player.guilds.find(g => g.id === msg.guild.id);
		const xp = guildProfile ? guildProfile.xp : 0;

		const rank = xp === 0 ? msg.guild.memberCount : (await this.Atlas.DB.User.count({
			'guilds.id': msg.guild.id,
			'guilds.$.xp': {
				$gte: xp,
			},
		})) + 1;

		// todo: this is inefficient too
		const { remaining, current, next } = this.Atlas.lib.xputil.getUserXPProfile(xp);

		return responder.embed({
			author: {
				name: user.username,
				icon_url: user.avatarURL,
			},
			fields: [{
				name: 'embed.rank',
				value: `${rank}/${msg.guild.memberCount}`,
				inline: true,
			}, {
				name: 'embed.level',
				value: `${current.level}`,
				inline: true,
			}, {
				name: 'embed.experience.name',
				value: ['embed.experience.value', remaining, next.xp, xp.toLocaleString]
					.map(v => (typeof v === 'number' ? v.toLocaleString() : v)),
				inline: true,
			}],
		}).send();
	}
};

module.exports.info = {
	name: 'level',
	aliases: [
		'levels',
		'score',
	],
	guildOnly: true,
};
