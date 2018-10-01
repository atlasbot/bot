const Command = require('../../structures/Command.js');

module.exports = class WhoIs extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (args[0]) {
			const user = await this.Atlas.util.findMember(msg.guild, args.join(' '), {
				percent: 0.60,
				memberOnly: true,
			});

			if (user) {
				const presence = this.Atlas.lib.utils.formatStatus(user.status);

				const embed = {
					thumbnail: {
						url: user.avatarURL || user.defaultAvatarURL,
					},
					fields: [
						{
							name: 'whois.embed.tag.name',
							value: ['whois.embed.tag.value', user.tag],
							inline: true,
						},
						{
							name: 'whois.embed.avatarURL.name',
							value: ['whois.embed.avatarURL.value', user.avatarURL || user.defaultAvatarURL],
							inline: true,
						},
						{
							name: 'whois.embed.createdAt.name',
							value: ['whois.embed.createdAt.value', (new Date(user.createdAt)).toLocaleDateString()],
							inline: true,
						},
					],
					timestamp: new Date(),
				};
				if (user.joinedAt) {
					embed.fields.push({
						name: 'whois.embed.joined.name',
						value: ['whois.embed.joined.value', (new Date(user.joinedAt)).toLocaleDateString()],
						inline: true,
					});
				}

				embed.fields.push({
					name: 'whois.embed.playing.name',
					value: user.game ? ['whois.embed.playing.value.set', user.game.name] : 'whois.embed.playing.value.null',
					inline: true,
				}, {
					name: 'whois.embed.status.name',
					value: ['whois.embed.status.value', presence],
					inline: true,
				});

				if (user.roles && user.roles.length !== 0) {
					embed.fields.push({
						name: ['whois.embed.roles.name', user.roles.length],
						value: (() => {
							const roles = user.roles.map(id => msg.guild.roles.get(id));
							const mentions = roles.map(r => r.mention).join(', ');

							if (mentions.length > 1024) {
								return ['whois.embed.roles.value.tooMany', roles.length];
							}

							return ['whois.embed.roles.value.set', mentions];
						})(),
					});
				}

				return responder.embed(embed).send();
			}

			return responder.error('general.noUserFound').send();
		}

		return responder.error('whois.noUser').send();
	}
};

module.exports.info = {
	name: 'whois',
	aliases: ['userinfo', 'aboutuser'],
	examples: [
		'@Sylver',
	],
};
