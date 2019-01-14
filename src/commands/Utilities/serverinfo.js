const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'serverinfo');

		const owner = await settings.findMember(msg.guild.ownerID);

		return responder.embed({
			thumbnail: {
				url: msg.guild.iconURL,
			},
			fields: [{
				name: 'name.name',
				value: msg.guild.name,
				inline: true,
			}, {
				name: 'verificationLevel.name',
				value: this.Atlas.constants.verificationLevels.find(v => v.level === msg.guild.verificationLevel).text,
				inline: true,
			}, {
				name: 'textChannels.name',
				value: msg.guild.channels.filter(c => c.type === 0).length.toLocaleString(),
				inline: true,
			}, {
				name: 'voiceChannels.name',
				value: msg.guild.channels.filter(c => c.type === 2).length.toLocaleString(),
				inline: true,
			}, {
				name: 'region.name',
				value: this.Atlas.lib.utils.cleanRegion(msg.guild.region),
				inline: true,
			}, {
				name: 'roles.name',
				value: msg.guild.roles.size.toLocaleString(),
				inline: true,
			}, {
				name: 'members.name',
				value: msg.guild.memberCount.toLocaleString(),
				inline: true,
			}, {
				name: 'owner.name',
				value: owner ? owner.tag : '???',
				inline: true,
			}],
			timestamp: new Date(msg.guild.createdAt),
			footer: {
				text: 'footer',
			},
		}).send();
	}
};

module.exports.info = {
	name: 'serverinfo',
	aliases: ['guildinfo', 'sinfo'],
	guildOnly: true,
};
