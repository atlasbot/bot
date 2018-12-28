const Parser = require('../tagengine');
const Responder = require('../structures/Responder');

module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getSettings(guild.id);

		const gatekeeper = settings.plugin('gatekeeper');

		const channel = guild.channels.get(gatekeeper.leave.channel);

		await settings.runActions({
			guild: guild.id,
			'trigger.type': 'guildMemberRemove',
		}, {
			msg: {
				member,
				guild,
				author: member.user,
				channel: channel || guild.channels.get(guild.systemChannelID),
			},
			user: member.user,
		});

		// regex stops people joining with invites/other links in their name and immediately leaving to advertise things.
		// idk why i decided to use regex but it's gud enuf
		if (gatekeeper.state === 'enabled' && !/[A-z]{2,}\.(?:com|gg|io|net|org|tv|me)/.test(member.username)) {
			const responder = new Responder(null, settings.lang);


			if (gatekeeper.leave.enabled) {
				if (channel) {
					const parser = new Parser({
						channel,
						settings,
						user: member,
						guild,
					}, true);

					const { output } = await parser.parse(gatekeeper.leave.content);

					await responder.channel(channel).localised(true).text(output).send();
				}
			}
		}

		if (!settings.actionLogChannel) {
			return;
		}

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, member.id, 20);

		if (auditEntry) {
			// the user has been kicked

			// the user probably left of their own free will

			return settings.log('mod', {
				title: 'general.logs.guildMemberKick.title',
				color: this.Atlas.colors.get('cyan').decimal,
				description: ['general.logs.guildMemberKick.description', member.tag],
				thumbnail: {
					url: member.avatarURL,
				},
				fields: [{
					name: 'general.logs.guildMemberKick.moderator.name',
					value: auditEntry.user.tag,
				}],
				footer: {
					text: `User ${member.id} Mod ${auditEntry.user.id}`,
				},
				timestamp: new Date(),
			});
		}

		// the user probably left of their own free will

		return settings.log('action', {
			title: 'general.logs.guildMemberRemove.title',
			color: this.Atlas.colors.get('cyan').decimal,
			description: ['general.logs.guildMemberRemove.description', member.tag],
			thumbnail: {
				url: member.avatarURL,
			},
			footer: {
				text: `User ${member.id}`,
			},
			timestamp: new Date(),
		});
	}
};
