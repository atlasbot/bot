const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'iam');

		const iam = settings.plugin('roles').options.iam
			// map id's to roles
			.map(r => msg.guild.roles.get(r))
			// remove invalid/deleted roles
			.filter(r => r)
			// add a "role.memberCount" key to each role for ~~shits and giggles~~ usability
			.map((r) => {
				r.memberCount = msg.guild.members.filter(m => m.roles.includes(r.id)).length;

				return r;
			});

		if (!iam.length) {
			return responder.error('noRoles').send();
		}

		if (args.length) {
			// they want a role
			const query = args.join(' ');

			const role = this.Atlas.lib.utils.nbsFuzzy(iam, ['name', 'id'], query);

			if (!role) {
				return responder.error('invalidQuery', query).send();
			}

			if (role.higherThan(msg.guild.me.highestRole)) {
				return responder.error('unassignable').send();
			}

			if (msg.member.roles.includes(role.id)) {
				await msg.member.removeRole(role.id, '"iam" role at request of user');

				return responder.text('removed', role.name).send();
			}

			await msg.member.addRole(role.id, '"iam" role at request of user');

			return responder.text('added', role.name).send();
		}

		// they probably don't want a role, so just throw them the whole kitchen sink for luls i guess

		// sort so most used roles are at the top
		iam.sort((a, b) => a.memberCount - b.memberCount);

		// show them all the roles
		return responder.paginate({
			user: msg.author.id,
			total: iam.length,
		}, (paginator) => {
			const page = this.Atlas.lib.utils.paginateArray(iam, paginator.page.current, 6);
			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			if (!page.data.length) {
				return;
			}

			const col1 = page.data.map(r => `• ${r.mention}`);
			const col2 = col1.splice(0, Math.floor(col1.length / 2));

			const embed = {
				fields: [
					{
						name: 'embed.title',
						value: col1.join('\n'),
						inline: true,
					},
				],
				footer: {
					text: ['embed.footer', msg.displayPrefix],
				},
				timestamp: new Date(),
			};

			if (col2.length) {
				embed.fields.push({
					// This has a zero-width character in it
					name: '​',
					value: col2.join('\n'),
					inline: true,
				});
			}

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'iam',
	aliases: ['giveme', 'roleme', 'iamnot'],
	guildOnly: true,
};
