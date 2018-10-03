module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(guild, role, oldRole) {
		const settings = await this.Atlas.DB.getGuild(guild.id);

		if (!settings.actionLogChannel) {
			return;
		}

		const changes = [];

		if (role.color !== oldRole.color) {
			const newColor = role.color
				? role.color.toString(16)
				: this.Atlas.colors.get('ROLE DEFAULT').decimal.toString(16);

			const oldColor = oldRole.color
				? oldRole.color.toString(16)
				: this.Atlas.colors.get('ROLE DEFAULT').decimal.toString(16);

			changes.push({
				name: 'general.logs.guildRoleUpdate.colorChange.name',
				value: `#${oldColor} => #${newColor}`,
				inline: true,
			});
		}

		if (role.name !== oldRole.name) {
			changes.push({
				name: 'general.logs.guildRoleUpdate.nameChange.name',
				value: `${oldRole.name} => ${role.name}`,
				inline: true,
			});
		}

		const oldPerms = Object.keys(oldRole.permissions.json);
		const newPerms = Object.keys(role.permissions.json);

		const added = newPerms.filter(p => !oldPerms.includes(p))
			.map(p => this.Atlas.util.format(settings.lang, `general.permissions.list.${p}`) || p);
		const removed = oldPerms.filter(p => !newPerms.includes(p))
			.map(p => this.Atlas.util.format(settings.lang, `general.permissions.list.${p}`) || p);

		if (role.hoist !== oldRole.hoist) {
			if (role.hoist) {
				changes.push({
					name: 'general.logs.guildRoleUpdate.hoistTrue.name',
					value: 'general.logs.guildRoleUpdate.hoistTrue.value',
					inline: true,
				});
			} else {
				changes.push({
					name: 'general.logs.guildRoleUpdate.hoistFalse.name',
					value: 'general.logs.guildRoleUpdate.hoistFalse.value',
					inline: true,
				});
			}
		}

		if (role.mentionable !== oldRole.mentionable) {
			if (role.mentionable) {
				changes.push({
					name: 'general.logs.guildRoleUpdate.mentionableTrue.name',
					value: 'general.logs.guildRoleUpdate.mentionableTrue.value',
					inline: true,
				});
			} else {
				changes.push({
					name: 'general.logs.guildRoleUpdate.mentionableFalse.name',
					value: 'general.logs.guildRoleUpdate.mentionableFalse.value',
					inline: true,
				});
			}
		}

		if (added.length) {
			changes.push({
				name: 'general.logs.guildRoleUpdate.permAdded.name',
				value: ['general.logs.guildRoleUpdate.permAdded.value', added.join('`, `')],
				inline: true,
			});
		}

		if (removed.length) {
			changes.push({
				name: 'general.logs.guildRoleUpdate.permRemoved.name',
				value: ['general.logs.guildRoleUpdate.permRemoved.value', removed.join('`, `')],
				inline: true,
			});
		}

		if (changes.length) {
			const auditEntry = await this.Atlas.util.getGuildAuditEntry(guild, role.id, 31);

			const embed = {
				title: 'general.logs.guildRoleUpdate.title',
				color: this.Atlas.colors.get('blue grey').decimal,
				description: ['general.logs.guildRoleUpdate.description', role.mention],
				fields: changes,
				footer: {
					text: `Role ${role.id}`,
				},
				timestamp: new Date(),
			};

			if (auditEntry) {
				embed.fields.push({
					name: 'general.logs.guildRoleUpdate.moderator.name',
					value: auditEntry.user.tag,
				});

				embed.footer.text += ` Mod ${auditEntry.user.id}`;
			}

			return settings.log('action', embed);
		}
	}
};
