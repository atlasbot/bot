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

		const user = await settings.findMember(args.join(' '));
		if (!user) {
			return responder.error('noUser', args.join(' ')).send();
		}

		const profile = await this.Atlas.DB.get('users').findOne({
			id: user.id,
		});

		let level = 0;
		const guildProfile = profile.guilds.find(g => g.id === msg.guild.id);

		if (guildProfile) {
			// if they don't have a guild profile
			({ current: { level } } = this.Atlas.lib.xputil.getUserXPProfile(guildProfile.xp));

			await this.Atlas.DB.get('users').update({ id: user.id, 'guilds.id': msg.guild.id }, {
				'guilds.$.xp': 0,
			});
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
