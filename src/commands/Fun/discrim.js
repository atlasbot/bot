const Command = require('../../structures/Command.js');

const REGEX = /[0-9]{4}/;

module.exports = class Discrim extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg);

		let discrim;
		if (args[0]) {
			const match = REGEX.exec(args.join(' '));

			if (match && match[0]) {
				[discrim] = match;
			} else {
				return responder.error('discrim.invalid', args.join(' '));
			}
		} else {
			discrim = msg.author.discriminator;
		}

		const matching = msg.guild.members.filter(({ discriminator }) => discriminator === discrim);

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
				title: ['discrim.title', discrim],
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
