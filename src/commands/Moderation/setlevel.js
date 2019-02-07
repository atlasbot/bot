const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'setlevel');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const user = await settings.findUser(args[0]);
		if (!user) {
			return responder.error('invalidUser', args[0]).send();
		}

		if (user.bot) {
			return responder.error('bot').send();
		}

		const level = this.Atlas.lib.utils.parseNumber(args[1]);
		if (isNaN(level) || level < 0 || level > 150) {
			return responder.error('noLevel', args[1]).send();
		}

		const profile = await this.Atlas.DB.getUser(user);
		const guildProfile = profile.guildProfile(msg.guild.id, false);
		const oldLevel = this.Atlas.lib.xputil.getLevelFromXP(guildProfile.xp);

		const xp = this.Atlas.lib.xputil.getLevelXP(level);

		if (guildProfile) {
			await profile.update({
				$set: {
					'guilds.$.xp': xp,
				},
			}, { id: user.id, 'guilds.id': msg.guild.id });
		} else {
			await profile.update({
				$push: {
					guilds: {
						id: msg.guild.id,
						messages: 0,
						xp,
					},
				},
			});
		}

		await settings.log('mod', {
			title: 'general.logs.levelSet.title',
			description: ['general.logs.levelSet.description', oldLevel, level],
			fields: [{
				name: 'general.logs.levelSet.moderator.name',
				value: ['general.logs.levelSet.moderator.value', msg.author.username, msg.author.id],
				inline: true,
			}, {
				name: 'general.logs.levelSet.target.name',
				value: ['general.logs.levelSet.target.value', user.username, user.id],
				inline: true,
			}],
			timestamp: new Date(),
		});

		return responder.text('success', msg.guild.members.has(user.id) ? user.mention : user.tag, level).send();
	}
};

module.exports.info = {
	name: 'setlevel',
	examples: [
		'@random 0',
		'@user 23',
		'@user 57.35',
	],
	permissions: {
		user: {
			administrator: true,
		},
	},
	guildOnly: true,
};
