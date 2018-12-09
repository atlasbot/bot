const Command = require('../../../structures/Command.js');
const lib = require('./../../../../lib');


module.exports = class View extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		const target = args[0] ? await this.Atlas.util.findMember(msg.guild, args.join(' ')) : msg.member;

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		if (target.id !== msg.author.id && !msg.member.permission.json.manageMessages) {
			return responder.error('warn.view.noPerms').send();
		}

		const warnings = await settings.getInfractions(target);
		if (!warnings.length) {
			return responder.text('warn.view.noWarns', target.mention).send();
		}

		const pageN = !isFinite(args[1]) ? 1 : Number(args[1]);

		responder.paginate({
			user: msg.author.id,
			page: pageN,
		}, (paginator) => {
			const page = lib.utils.paginateArray(warnings, paginator.page.current, 4);

			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			if (page.data.length === 0) {
				return;
			}

			return {
				author: {
					name: `${target.username}'s Warnings`,
					icon_url: target.avatarURL,
				},
				fields: page.data.map((w) => {
					const moderator = msg.guild.members.get(w.moderator);
					const name = `${moderator ? `${moderator.tag} (${w.moderator})` : w.moderator}`;
					const value = `${w.reason} • ${new Date(w.createdAt).toLocaleDateString()}`;

					return {
						name,
						value,
					};
				}),
				timestamp: new Date(),
				footer: {
					text: paginator.showPages
						? `Page ${paginator.page.current}/${paginator.page.total} • ${warnings.length} total warns`
						: `${warnings.length} total warns`,
				},
			};
		}).send();
	}
};

module.exports.info = {
	name: 'view',
	aliases: ['list'],
	examples: [
		'@random',
		'@sylver',
	],
	guildOnly: true,
};
