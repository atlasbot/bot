const cache = require('../cache');
const Parser = require('../tagengine');
const Responder = require('../structures/Responder');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member) {
		// dashboard has high cache times for settings, channels, guilds, etc... to speed things up
		// when they're updated the bot can clear those caches to make update times instant while still
		// getting the performance boost from caching
		await cache.members.del(`${guild.id}.${member.id}`);
		await cache.userGuilds.del(member.id);

		const settings = await this.Atlas.DB.getGuild(guild);

		const mutes = await this.Atlas.agenda.agenda.jobs({
			name: 'unmute',
			'data.target': member.id,
			nextRunAt: {
				$ne: null,
				$gte: new Date(),
			},
			lastFinishedAt: null,
		});

		if (mutes.length) {
			const mute = mutes[0].attrs;
			const role = guild.roles.get(mute.data.role) || settings.muteRole;

			if (role && guild.me.highestRole.higherThan(role) && guild.me.permission.has('manageRoles') && !(member.roles || []).includes(role.id)) {
				member.addRole(role.id, 'Mute evasion.');
			}
		}

		const levels = settings.plugin('levels');

		if (levels.state === 'enabled') {
			const profile = await this.Atlas.DB.getUser(member);
			const guildProfile = profile.guildProfile(guild.id, false);

			if (guildProfile) {
				const level = this.Atlas.lib.xputil.getLevelFromXP(guildProfile.xp);

				const shouldHave = this.Atlas.util.getLevelRoles(levels.options, level, guild);

				for (const role of shouldHave) {
					if (member.roles.includes(role.id) || !member.guild.me.highestRole.higherThan(role)) {
						continue;
					}

					// give them the role
					await member.addRole(role.id, 'Rewards from an existing level on join');
				}
			}
		}

		const roles = settings.plugin('roles');
		const gatekeeper = settings.plugin('gatekeeper');

		if (roles.state === 'enabled' && roles.options.join.length) {
			// add join roles
			const toAdd = roles.options.join
				.map(r => guild.roles.get(r))
				// remove deleted roles, roles higher than us (ones we can't assign) or roles the user already somehow has
				.filter(r => r && !r.higherThan(guild.me.highestRole) && !(member.roles || []).includes(r.id))
				.slice(0, 5);

			if (toAdd.length) {
				// 5 roles max
				for (const role of toAdd) {
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
			'flags.enabled': true,
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
