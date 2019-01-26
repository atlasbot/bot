const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'resetlevel');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const user = await settings.findUser(args.join(' '));
		if (!user) {
			return responder.error('noUser', args.join(' ')).send();
		}

		const profile = await this.Atlas.DB.getUser(user);

		let level = 0;
		const guildProfile = profile.guildProfile(msg.guild.id, false);

		if (guildProfile) {
			// if they don't have a guild profile
			({ current: { level } } = this.Atlas.lib.xputil.getUserXPProfile(guildProfile.xp));

			await profile.update({
				$set: {
					'guilds.$.xp': 0,
				},
			}, { id: user.id, 'guilds.id': msg.guild.id });
		}

		await settings.log('mod', {
			title: 'general.logs.levelReset.title',
			description: ['general.logs.levelReset.description', user.tag, level],
			fields: [{
				name: 'general.logs.levelReset.moderator.name',
				value: ['general.logs.levelReset.moderator.value', msg.author.tag],
				inline: true,
			}, {
				name: 'general.logs.levelReset.target.name',
				value: ['general.logs.levelReset.target.value', user.tag],
				inline: true,
			}],
			footer: {
				text: `Administrator ${msg.author.id} Target ${user.id}`,
			},
			timestamp: new Date(),
		});

		return responder.text('success', msg.guild.members.has(user.id) ? user.mention : user.tag).send();
	}
};

module.exports.info = {
	name: 'resetlevel',
	examples: [
		'@random',
	],
	permissions: {
		user: {
			administrator: true,
		},
	},
	guildOnly: true,
};
