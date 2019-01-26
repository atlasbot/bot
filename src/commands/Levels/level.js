const Command = require('../../structures/Command.js');

// todo: this command is inefficient, the whole user profile system is actually

module.exports = class extends Command {
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

			user = await settings.findUser(query, {
				memberOnly: true,
			});

			if (!user) {
				return responder.error('invalidUser', query).send();
			}
		}

		// DB#user should generate the profile if it doesn't exist anyway
		const player = await this.Atlas.DB.getUser(user);

		if (!player) {
			return responder.error('noProfile').send();
		}

		const { xp } = player.guildProfile(msg.guild.id);

		const rank = xp === 0 ? msg.guild.memberCount : (await this.Atlas.DB.get('users').count({
			'guilds.id': msg.guild.id,
			'guilds.xp': {
				$gte: xp,
			},
		}));

		// todo: this is inefficient too
		const { current, next } = this.Atlas.lib.xputil.getUserXPProfile(xp);

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
				value: ['embed.experience.value', next.completed, next.xp, xp.toLocaleString].map(v => (v.toLocaleString ? v.toLocaleString() : v)),
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
	examples: [
		'@user',
		'',
	],
	guildOnly: true,
};
