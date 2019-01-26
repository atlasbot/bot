const cache = require('../cache');

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(channel) {
		const settings = channel.guild && await this.Atlas.DB.getGuild(channel.guild);

		if (!channel.guild || !settings.actionLogChannel) {
			return;
		}

		if (channel.guild) {
			// dashboard has high cache times for settings, channels, guilds, etc... to speed things up
		// when they're updated the bot can clear those caches to make update times instant while still
		// getting the performance boost from caching
			await cache.channels.del(channel.guild.id);
		}

		const type = this.Atlas.lib.utils.getChannelType(channel.type);

		const auditEntry = await this.Atlas.util.getGuildAuditEntry(channel.guild, channel.id, 12);

		const embed = {
			title: 'general.logs.channelDelete.title',
			color: this.Atlas.colors.get('green').decimal,
			description: ['general.logs.channelDelete.description', channel.name, type],
			fields: [],
			footer: {
				text: `Channel ${channel.id}`,
			},
			timestamp: new Date(),
		};

		if (channel.parentID) {
			const { name } = channel.guild.channels.get(channel.parentID);
			embed.fields.push({
				name: 'general.logs.channelDelete.category.name',
				value: name,
				inline: true,
			});
		}

		if (auditEntry) {
			embed.fields.push({
				name: 'general.logs.channelDelete.moderator.name',
				value: auditEntry.user.tag,
				inline: true,
			});

			embed.footer.text += ` User ${auditEntry.user.id}`;
		}

		return settings.log('action', embed);
	}
};
