const superagent = require('superagent');
const emoji = require('../../../lib/emoji');
const Command = require('../../structures/Command.js');

const emojis = Object.entries(emoji).map(([name, data]) => ({
	name,
	...data,
})).filter(e => e.category === 'flags');

module.exports = class Locale extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg, null, 'locale');

		// fetching it from here so we can also get the names of languages
		const { body } = await superagent.post(`https://api.crowdin.com/api/project/${process.env.CROWDIN_PROJECT}/status`)
			.query({
				key: process.env.CROWDIN_KEY,
				json: true,
			});

		console.log(body.length);

		const supported = [...body.filter(l => this.Atlas.locales.has(l.code)), {
			name: 'English',
			code: 'gb',
		}];

		if (!args.length) {
			const formatted = supported.map(({ name, code, translated_progress: translated }) => {
				const key = code.split('-').pop().toLowerCase();

				const keys = [`flag_${key}`, key, name];
				const e = emojis.find(x => keys.includes(x.name) || x.keywords.some(k => keys.includes(k)));

				if (e) {
					name = `${e.char} ${name}`;
				}

				if (translated != undefined) { // eslint-disable-line eqeqeq
					name = `${name} • [${translated}% translated](https://translate.atlasbot.xyz/project/getatlas/${code})`;
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
