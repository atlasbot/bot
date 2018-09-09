const moment = require('moment');
const Command = require('../../structures/Command.js');

const aliases = [
	{
		name: 'online',
		alias: 'Online',
	},
	{
		name: 'idle',
		alias: 'Idle',
	},
	{
		name: 'dnd',
		alias: 'Do Not Disturb',
	},
	{
		name: 'offline',
		alias: 'Offline',
	},
];

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
				const [presence] = aliases.filter(a => a.name === user.status);
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
							value: ['whois.embed.createdAt.value', moment(user.createdAt).fromNow()],
							inline: true,
						},
					],
					timestamp: new Date(),
				};
				if (user.joinedAt) {
					embed.fields.push({
						name: 'whois.embed.joined.name',
						value: ['whois.embed.joined.value', moment(user.joinedAt).fromNow()],
						inline: true,
					});
				}

				embed.fields.push(...[{
					name: 'whois.embed.playing.name',
					value: user.game ? ['whois.embed.playing.value.set', user.game.name] : 'whois.embed.playing.value.null',
					inline: true,
				}, {
					name: 'whois.embed.status.name',
					value: ['whois.embed.status.value', presence.alias],
					inline: true,
				}, {
					name: 'whois.embed.roles.name',
					value: (() => {
						const roles = user.roles || [];
						if (roles.length !== 0) {
							const mentions = roles.map(r => r.mention).join(', ');
							if (mentions.length > 1024) {
								// fixme
								return ['whois.embed.roles.value.tooMany', roles.length];
							}

							return ['whois.embed.roles.value.set', mentions];
						}

						return 'whois.embed.roles.value.null';
					})(),
				}]);

				return responder.embed(embed).send();
			}

			return responder.error('general.noUserFound').send();
		}

		return responder.error('whois.noUser').send();
	}
};

module.exports.info = {
	name: 'whois',
	usage: 'info.whois.usage',
	description: 'info.whois.description',
	aliases: ['userinfo', 'aboutuser'],
	examples: [
		'@Sylver',
	],
};
