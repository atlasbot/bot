const Parser = require('../tagengine');
const Responder = require('../structures/Responder');

module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.getSettings(guild.id);

		const gatekeeper = settings.plugin('gatekeeper');

		const channel = guild.channels.get(gatekeeper.channel.channel);

		await settings.runActions({
			guild: guild.id,
			'trigger.type': 'guildMemberAdd',
		}, {
			msg: {
				guild,
				member,
				author: member.user,
				channel: channel || guild.channels.get(guild.systemChannelID),
			},
			user: member.user,
		});

		// regex stops people joining with invites/other links in their name and immediately leaving to advertise things.
		// idk why i decided to use regex but it's gud enuf
		if (gatekeeper.state === 'enabled' && !/[A-z]{2,}\.(?:com|gg|io|net|org|tv|me)/.test(member.username)) {
			const responder = new Responder(null, settings.lang);

			const parser = new Parser({
				settings,
				user: member,
				guild,
			}, true);

			if (gatekeeper.channel.enabled) {
				if (channel) {
					parser.data.channel = channel;

					const { output } = await parser.parse(gatekeeper.channel.content);

					await responder.channel(channel).localised(true).text(output).send();
				}
			}

			if (gatekeeper.dm.enabled) {
				try {
					const dmChannel = await member.user.getDMChannel();

					parser.data.channel = dmChannel;

					const { output } = await parser.parse(gatekeeper.dm.content);

					await responder.channel(dmChannel).localised(true).text(output).send();
				} catch (e) {
					console.warn(e);
				}
			}
		}

		if (!settings.actionLogChannel) {
			return;
		}

		const embed = {
			title: 'general.logs.guildMemberAdd.title',
			color: this.Atlas.colors.get('cyan').decimal,
			description: ['general.logs.guildMemberAdd.description', member.tag],
			fields: [{
				name: 'Account Created',
				value: (new Date(member.createdAt)).toLocaleDateString(),
			}],
			thumbnail: {
				url: member.avatarURL,
			},
			footer: {
				text: `User ${member.id}`,
			},
			timestamp: new Date(),
		};

		return settings.log('action', embed);
	}
};
