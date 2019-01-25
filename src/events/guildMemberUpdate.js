const cache = require('../cache');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member, oldMember) {
		if (!member || !oldMember) {
			return;
		}

		// dashboard has high cache times for settings, channels, guilds, etc... to speed things up
		// when they're updated the bot can clear those caches to make update times instant while still
		// getting the performance boost from caching
		await cache.members.del(`${guild.id}.${member.id}`);

		await this.Atlas.util.updateUser(member);

		const settings = await this.Atlas.DB.settings(guild);

		if (!settings.actionLogChannel) {
			return;
		}

		if (member.roles && oldMember.roles) {
			const added = guild.roles.get(member.roles.find(r => !oldMember.roles.includes(r)));
			const removed = guild.roles.get(oldMember.roles.find(r => !member.roles.includes(r)));

			const role = added || removed;

			if (role) {
				if (this.Atlas.ignoreUpdates.find(r => r.role === role.id && r.user === member.id && (Date.now() - r.date) < 5000)) {
					// something else is going to handle logging (probably), so ignore it
					return;
				}

				const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, member.id, 25);
				const key = added ? 'roleAdd' : 'roleRemove';

				const embed = {
					// longest key ever lol
					title: `general.logs.guildMemberUpdate.${key}.title`,
					color: this.Atlas.colors.get('purple').decimal,
					description: [`general.logs.guildMemberUpdate.${key}.description`, member.tag, role.mention],
					fields: [],
					thumbnail: {
						url: member.avatarURL,
					},
					footer: {
						text: `User ${member.id} Role ${role.id}`,
					},
					timestamp: new Date(),
				};

				if (auditEntry) {
					embed.fields.push({
						name: `general.logs.guildMemberUpdate.${key}.moderator.name`,
						value: [
							`general.logs.guildMemberUpdate.${key}.moderator.value`,
							auditEntry.user.tag,
							auditEntry.user.id,
						],
						inline: true,
					});
					if (auditEntry.reason) {
						embed.fields.push({
							name: `general.logs.guildMemberUpdate.${key}.reason`,
							value: auditEntry.reason,
							inline: true,
						});
					}
				}

				return settings.log('action', embed);
			}
		}

		const oldUsername = oldMember.username;
		const { username } = member;

		if (oldUsername && username && username !== oldUsername) {
			return settings.log('action', {
				title: 'general.logs.guildMemberUpdate.usernameChange.title',
				description: [
					'general.logs.guildMemberUpdate.usernameChange.description',
					member.tag,
					member.username,
					oldMember.username,
				],
				footer: {
					text: `User ${member.id}`,
				},
			});
		}

		// old member avatar is sometimes unset even when one did exist
		// discord being discord idk
		if (oldMember.avatar && member.avatar !== oldMember.avatar) {
			return settings.log('action', {
				title: 'general.logs.guildMemberUpdate.avatarChange',
				thumbnail: {
					// might change this to use the old avatar at some point
					url: member.avatarURL,
				},
				description: [
					'general.logs.guildMemberUpdate.avatarChange',
					member.tag,
					member.avatarURL,
					oldMember.avatarURL,
				],
				footer: {
					text: `User ${member.id}`,
				},
			});
		}
	}
};
