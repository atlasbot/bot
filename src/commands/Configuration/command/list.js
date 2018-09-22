const Command = require('../../../structures/Command.js');

module.exports = class List extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		const actions = settings.plugin('actions').actions
			.filter(a => a.trigger.type === 'label');

		if (!actions[0]) {
			return responder.error('command.list.noActions').send();
		}

		const pageN = isNaN(args[0]) ? 1 : Number(args[0]);

		return responder.paginate({
			user: msg.author.id,
			page: pageN,
		}, (paginator) => {
			const page = this.Atlas.lib.utils.paginateArray(actions, paginator.page.current, 4);
			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			if (page.data.length === 0) {
				return;
			}

			const fields = page.data.map(p => ({
				name: p.trigger.content,
				value: p.description,
				inline: true,
			}));

			const embed = {
				title: 'command.list.embed.title',
				thumbnail: {
					// fuck
					url: msg.guild.iconURL || msg.author.avatarURL || msg.author.defaultAvatarURL,
				},
				description: ['command.list.embed.description', msg.guild.name],
				timestamp: new Date(),
				footer: {
					text: paginator.showPage ? `Page ${paginator.page.current}/${paginator.page.total}` : null,
				},
				fields,
			};

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'list',
	description: 'info.command.list.description',
	guildOnly: true,
	aliases: [
		'view',
		'show',
		'showall',
	],
};
