const Parser = require('../tagengine');
const Responder = require('../structures/Responder');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		const settings = await this.Atlas.DB.settings(guild);

		const roles = settings.plugin('roles');
		const gatekeeper = settings.plugin('gatekeeper');

		if (roles.state === 'enabled' && roles.options.join.length) {
			// add join roles
			const toAdd = roles.options.join.map(r => guild.roles.get(r)).filter(r => r && !r.higherThan(guild.me.highestRole));

			if (toAdd.length) {
				// 5 roles max
				for (const role of toAdd.slice(0, 5).filter(r => !member.roles.includes(r.id))) {
					try {
						await member.addRole(role.id);
					} catch (e) {
						console.warn(e);

						this.Atlas.Sentry.captureException(e);
					}
				}
			}
		}

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
		if (gatekeeper.state === 'enabled' && !/[A-z]{2,}\.(?:com|gg|io|net|org|tv|me)/.test(member.username)) {
			const responder = new Responder(null, settings.lang);

			if (gatekeeper.channel.enabled) {
				if (channel && channel.permissionsOf(guild.me.id).has('sendMessages')) {
					const parser = new Parser({
						settings,
						user: member.user,
						channel,
						guild,
					});

					const { output } = await parser.parse(gatekeeper.channel.content);

					if (output) {
						await responder.channel(channel).localised(true).text(output).send();
					}
				}
			}

			if (gatekeeper.dm.enabled) {
				try {
					const dmChannel = await member.user.getDMChannel();

					const parser = new Parser({
						settings,
						user: member.user,
						channel: dmChannel,
						guild,
					});

					const { output } = await parser.parse(gatekeeper.dm.content);

					if (output) {
						await responder.channel(dmChannel).localised(true).text(output).send();
					}
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
