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

		const query = args.shift();
		const target = args[0] ? await this.Atlas.util.findMember(msg.guild, query) : msg.member;

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		if (target.id !== msg.author.id && !msg.member.permission.json.manageMessages) {
			return responder.error('warn.view.noPerms').send();
		}

		const warnings = settings.getWarnings(target);
		if (warnings.length === 0) {
			return responder.text('warn.view.noWarns', target.mention).send();
		}

		const pageN = isNaN(args[1]) ? 1 : Number(args[1]);

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

			const table1 = page.data.map(w => w.reason);
			const table2 = page.data.map(w => (new Date(w.date)).toLocaleDateString());
			const table3 = page.data.map((w) => {
				const member = msg.guild.members.get(w.moderator);
				if (member) {
					return member.tag;
				}

				return w.moderator;
			});

			const embed = {
				title: `${target.tag}'s Warnings`,
				description: `${target.nick || target.username} has ${warnings.length} warnings.`,
				fields: [{
					name: 'Reason',
					value: table1.join('\n'),
					inline: true,
				}, {
					name: 'Date',
					value: table2.join('\n'),
					inline: true,
				}, {
					name: 'Moderator',
					value: table3.join('\n'),
					inline: true,
				}],
				timestamp: new Date(),
				footer: {
					text: paginator.footer,
				},
			};

			return embed;
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
