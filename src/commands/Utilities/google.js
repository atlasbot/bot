const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Google extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args.length) {
			return responder.error('google.noArgs').send();
		}

		const { body } = await superagent.get('https://www.googleapis.com/customsearch/v1')
			.query({
				key: process.env.GOOGLE_KEY,
				cx: process.env.GOOGLE_CX,
				q: args.join(' '),
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (!body.items) {
			return responder.error('google.noResults').send();
		}

		return responder.paginate({
			user: msg.author.id,
			total: body.items.length,
		}, (paginator) => {
			const item = body.items[paginator.page.current - 1];

			if (!item) {
				return;
			}

			return {
				title: item.title,
				description: item.snippet,
				url: item.link,
				timestamp: new Date(),
				footer: {
					text: paginator.footer,
				},
			};
		}).send();
	}
};

module.exports.info = {
	name: 'google',
	examples: [
		'why do i have no friends',
		'what would a chair look like if your knees bent the other way',
	],
};
