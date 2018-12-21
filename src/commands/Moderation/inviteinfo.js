const Command = require('../../structures/Command.js');

module.exports = class InviteInfo extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const match = this.Atlas.constants.inviteRegex.exec(args.join(' '));

		const code = match ? match[1] : args[0];

		try {
			const codeInfo = await this.Atlas.client.getInvite(code, true);

			const embed = {
				title: ['inviteinfo.title', code],
				url: `https://discord.gg/${code}`,
				fields: [{
					name: 'inviteinfo.guild.name',
					value: codeInfo.guild.name,
				}, {
					name: 'inviteinfo.memberCount.name',
					value: [
						'inviteinfo.memberCount.value',
						codeInfo.memberCount.toLocaleString(),
						codeInfo.presenceCount.toLocaleString(),
					],
				}],
				footer: {
					text: `Guild ${codeInfo.guild.id}`,
				},
			};

			if (codeInfo.channel) {
				embed.fields.push({
					name: 'inviteinfo.channel.name',
					value: [
						'inviteinfo.channel.value',
						codeInfo.channel.name,
						this.Atlas.lib.utils.getChannelType(codeInfo.channel.type),
					],
				});
			}

			if (codeInfo.inviter) {
				embed.fields.push({
					name: 'inviteinfo.inviter.name',
					value: codeInfo.inviter.tag,
				});

				embed.footer.text += ` Inviter ${codeInfo.inviter.id}`;
			}

			embed.fields.forEach((field) => {
				field.inline = true;
			});

			return responder.embed(embed).send();
		} catch (e) {
			return responder.error('inviteinfo.invalid', code).send();
		}
	}
};

module.exports.info = {
	name: 'inviteinfo',
	examples: [
		'https://discordapp.com/invite/AXXBPM7',
		'disord.gg/AXXBPM7',
		'AXXBPM7',
	],
	aliases: [
		'codeinfo',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			manageMessages: true,
		},
	},
};
