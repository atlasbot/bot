const lib = require('atlas-lib');

const Command = require('../../structures/Command.js');
const languageCodes = require('../../../data/languageCodes.json');

const overrides = {
	en: 'uk',
};

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, null, 'locale');

		const locales = Array.from(this.Atlas.locales.values()).map(l => ({
			...l,
			name: languageCodes[l.code],
		}));

		if (!args.length) {
			const formatted = locales.map(({ code, name }) => {
				if (overrides[code]) {
					code = overrides[code];
				}

				const emoji = [`flag_${code}`, code, name]
					.filter(e => e)
					.map(e => lib.emoji.get(e.toLowerCase()))
					.find(e => e && e.category === 'flags');

				if (emoji) {
					name = `${emoji.char} ${name}`;
				}

				// if (translated != undefined) { // eslint-disable-line eqeqeq
				// 	const percent = Math.floor((translated / total) * 100);

				// 	name += ` ${percent}%`;
				// }

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

		const language = (new this.Atlas.lib.structs.Fuzzy(locales, {
			keys: ['name', 'code'],
		})).search(args.join(' '));

		if (!language) {
			return responder.error('notFound', args.join(' ')).send();
		}

		await settings.update({
			lang: language.code,
		});

		return responder.lang(language.code).text('success', language.name).send();
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
