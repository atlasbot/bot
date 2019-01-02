const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'roleinfo');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const role = await settings.findRoleOrChannel(args.join(' '), {
			type: 'role',
		});

		if (!role) {
			return responder.error('invalidRole', args.join(' ')).send();
		}

		const color = this.Atlas.lib.utils.roleColor(role.color);

		return responder.embed({
			color: role.color || 0x4f545c,
			thumbnail: {
				url: `https://dummyimage.com/80x80/${color}/${color}.jpg`,
			},
			fields: [{
				// lol
				name: 'name.name',
				value: role.name,
				inline: true,
			}, {
				name: 'id.name',
				value: role.id,
				inline: true,
			}, {
				name: 'color.name',
				value: `[#${color}](http://www.color-hex.com/color/${color})`,
				inline: true,
			}, {
				name: 'mention.name',
				value: `\`${role.mention}\``,
				inline: true,
			}, {
				name: 'members.name',
				value: msg.guild.members.filter(m => m.roles.includes(role.id)).length,
				inline: true,
			}, {
				name: 'position.name',
				value: role.position,
				inline: true,
			}, {
				name: 'hoisted.name',
				value: role.hoist ? 'yes' : 'no',
				inline: true,
			}, {
				name: 'mentionable.name',
				value: role.mentionable ? 'yes' : 'no',
				inline: true,
			}],
			footer: {
				text: 'footer',
			},
			timestamp: new Date(role.createdAt),
		}, false).send();
	}
};

module.exports.info = {
	name: 'roleinfo',
	aliases: ['rinfo'],
	examples: [
		'@role',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
