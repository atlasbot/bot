const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args.length) {
			return responder.error('inrole.noArgs').send();
		}

		const role = await settings.findRoleOrChannel(args.join(' '), {
			type: 'role',
		});

		if (!role) {
			return responder.error('inrole.noRole', args.join(' ')).send();
		}

		const members = msg.guild.members.filter(m => m.roles.includes(role.id));

		if (!members.length) {
			return responder.error('inrole.noOne').send();
		}

		responder.paginate({
			user: msg.author.id,
		}, (paginator) => {
			const page = this.Atlas.lib.utils.paginateArray(members, paginator.page.current, 12);

			// reset total pages once it's been (re)calculated
			paginator.page.total = page.totalPages;

			if (!page.data.length) {
				return;
			}

			const embed = {
				timestamp: new Date(),
				fields: [],
				footer: {
					text: paginator.showPages ? `${members.length} total • ${paginator.footer.toLowerCase()}` : `${members.length} total`,
				},
			};

			if (page.data.length > 2) {
				const col1 = page.data;
				const col2 = col1.splice(0, Math.floor(page.data.length / 2));

				embed.fields.push({
					name: ['inrole.title', role.name],
					value: col1.map(({ tag }) => `• ${tag}`).join('\n'),
					inline: true,
				}, {
					// This has a zero-width character in it
					name: '​',
					value: col2.map(({ tag }) => `• ${tag}`).join('\n'),
					inline: true,
				});
			} else {
				embed.fields.push({
					name: ['inrole.title', role.name],
					value: page.data.map(({ tag }) => `• ${tag}`).join('\n'),
					inline: true,
				});
			}

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'inrole',
	examples: [
		'@role',
	],
	aliases: ['rolecount'],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
