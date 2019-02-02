const lib = require('atlas-lib');

const Command = require('../../structures/Command.js');

// eslint-disable-next-line import/no-unresolved
const languageMap = require('../../../data/languagemap.json');
const emojiLocales = require('../../../data/emojiLocales');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.locales = Array.from(this.Atlas.locales.values()).map((l) => {
			const data = languageMap.find(c => Object.values(c).find(v => v === l.code));

			let emoji;
			const raw = emojiLocales[data.iso_639_1];
			if (raw) {
				const a = String.fromCodePoint(raw.codePointAt(0) - 0x41 + 0x1F1E6);
				const b = String.fromCodePoint(raw.codePointAt(1) - 0x41 + 0x1F1E6);

				emoji = a + b;
			}

			if (!emoji) {
				emoji = [`flag_${l.code}`, l.code, data.name]
					.filter(e => e)
					.map(e => lib.emoji.get(e))
					.find(e => e && e.category === 'flags').char;
			}


			return {
				...l,
				...data,
				emoji,
				formatted: emoji ? `${emoji} ${data.name}` : data.name,
			};
		});
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'locale');


		if (!args.length) {
			return responder.paginate({
				user: msg.author.id,
				startAndEndSkip: false,
			}, async (paginator) => {
				const page = this.Atlas.lib.utils.paginateArray(this.locales, paginator.page.current, 14);
				// set the total page count once it's been (re)calculated
				paginator.page.total = page.totalPages;

				const col1 = page.data.map((r) => {
					if (msg.lang === r.code) {
						return `${r.formatted} (current)`;
					}

					return r.formatted;
				});
				const col2 = col1.splice(0, Math.floor(col1.length / 2));

				if (!page.data.length) {
					return;
				}

				const embed = {
					title: 'title',
					description: ['description', msg.prefix],
					fields: [{
						name: 'supported',
						value: col1.join('\n'),
						inline: true,
					}],
					timestamp: new Date(),
					footer: {
						text: paginator.footer,
					},
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

		const language = (new this.Atlas.lib.structs.Fuzzy(this.locales, {
			keys: ['name', 'code'],
		})).search(args.join(' '));

		if (!language) {
			return responder.error('notFound', args.join(' ')).send();
		}

		await settings.update({
			$set: {
				lang: language.code,
			},
		});

		return responder.lang(language.code).text('success', language.name).send();
	}
};

module.exports.info = {
	name: 'locale',
	aliases: ['translate', 'lang', 'language'],
	examples: [
		'english',
		'pirate english',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			manageGuild: true,
		},
	},
};
