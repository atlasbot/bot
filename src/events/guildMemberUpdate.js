module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, member, oldMember) {
		const settings = await this.Atlas.DB.getGuild(guild.id);

		if (member.roles && oldMember.roles) {
			const added = guild.roles.get(member.roles.find(r => !oldMember.roles.includes(r)));
			const removed = guild.roles.get(oldMember.roles.find(r => !member.roles.includes(r)));

			const role = added || removed;

			if (role) {
				const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild.id, member.id, 25);
				const key = added ? 'roleAdd' : 'roleRemove';

				const embed = {
					// longest key ever lol
					title: `general.logs.guildMemberUpdate.${key}.title`,
					color: this.Atlas.colors.get('purple').decimal,
					description: [`general.logs.guildMemberUpdate.${key}.description`, member.tag, role.mention],
					fields: [],
					thumbnail: {
						url: member.avatarURL || member.defaultAvatarURL,
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
						thumbnail: {
							url: member.avatarURL || member.defaultAvatarURL,
						},
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

		if (member.username !== oldMember.username) {
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

		if (member.avatarURL !== oldMember.avatarURL) {
			return settings.log('action', {
				title: 'general.logs.guildMemberUpdate.avatarChange',
				thumbnail: {
					// might change this to use the old avatar at some point
					url: member.avatarURL || member.defaultAvatarURL,
				},
				description: [
					'general.logs.guildMemberUpdate.avatarChange',
					member.tag,
					member.avatarURL || member.defaultAVatarURL,
					oldMember.avatarURL || oldMember.defaultAvatarURL,
				],
				footer: {
					text: `User ${member.id}`,
				},
			});
		}
	}
};
