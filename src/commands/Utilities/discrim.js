const Command = require('../../structures/Command.js');

module.exports = class Discrim extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		const number = args[0] || msg.author.discriminator;

		if (!/[0-9]{4}/.test(number)) {
			return responder.error('discrim.invalid', number);
		}

		const matching = msg.guild.members.filter(({ discriminator, id }) => discriminator === number && id !== msg.author.id);

		if (!matching.length) {
			return responder.error('discrim.none').send();
		}

		return responder.paginate({
			user: msg.author.id,
		}, (paginator) => {
			const page = this.Atlas.lib.utils.paginateArray(matching, paginator.page.current, 6);
			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			if (page.data.length === 0) {
				return;
			}

			const embed = {
				title: ['discrim.title', number],
				description: page.data.map(({ tag }) => `• ${tag}`).join('\n'),
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
	name: 'discrim',
	aliases: [
		'discriminator',
	],
};
