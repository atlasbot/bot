const superagent = require('superagent');
const Command = require('../../structures/Command.js');

const overrides = {
	us: 'gb',
};

module.exports = class Locale extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, null, 'locale');

		// fetching it from here so we can also get the names of languages
		const { body } = await superagent.get('https://api.crowdin.com/api/supported-languages?json');

		const supported = body.filter(l => this.Atlas.locales.has(l.crowdin_code));

		if (!args.length) {
			const formatted = supported.map((s) => {
				let { name } = s;

				const key = s.locale.split('-').pop().toLowerCase();

				const emoji = this.Atlas.lib.emoji.get(`flag_${overrides[key] || key}`);
				if (emoji) {
					name = `${emoji.char} ${name}`;
				}

				return name;
			});

			return responder.paginate({
				user: msg.author.id,
				startAndEndSkip: false,
			}, async (paginator) => {
				const page = this.Atlas.lib.utils.paginateArray(formatted, paginator.page.current, 8);
				// set the total page count once it's been (re)calculated
				paginator.page.total = page.totalPages;

				if (!page.data.length) {
					return;
				}

				return {
					title: 'title',
					description: ['description', msg.prefix, page.data.join('\n')],
					timestamp: new Date(),
					footer: {
						text: paginator.footer,
					},
				};
			}).send();
		}

		const language = (new this.Atlas.lib.structs.Fuzzy(supported, {
			keys: ['name', 'locale'],
		})).search(args.join(' '));

		if (!language) {
			return responder.error('notFound', args.join(' ')).send();
		}

		await settings.update({
			lang: language.crowdin_code,
		});

		return responder.text('success', language.name).send();
	}
};

module.exports.info = {
	name: 'locale',
	aliases: ['translate', 'lang', 'language'],
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			manageGuild: true,
		},
	},
};
