const superagent = require('superagent');

const Command = require('../../structures/Command.js');

const characters = require('./../../../data/gameOfThrones/characters.json');
const houses = require('./../../../data/gameOfThrones/houses.json');
const books = require('./../../../data/gameOfThrones/books.json');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const c = args[0] ? (new this.Atlas.lib.structs.Fuzzy(characters, {
			keys: ['name', 'id', 'aliases', 'titles', 'playedBy'],
		})).search(args.join(' ')) : this.Atlas.lib.utils.pickOne(characters);

		if (!c) {
			return responder.error('gotcharacter.notFound', args.join(' ')).send();
		}

		const char = {
			...c,
			books: c.books ? c.books.map(id => books.find(b => b.id === id)) : [],
			allegiances: c.allegiances ? c.allegiances.map(id => houses.find(h => h.id === id)) : [],
		};

		const d = (await superagent.get('https://awoiaf.westeros.org/api.php')
			.query({
				action: 'parse',
				page: char.name,
				format: 'json',
			})
			.set('User-Agent', this.Atlas)).body;

		let images;
		let properties;

		if (!d.error) {
			({ properties, images } = d.parse);
		}

		const embed = {
			title: char.name,
			thumbnail: {
				url: null,
			},
			fields: [],
			footer: {
				text: `Character ${char.id}`,
			},
			timestamp: new Date(),
		};

		if (char.titles && char.titles.length) {
			embed.fields.push({
				name: 'Titles',
				value: `• ${char.titles.join('\n• ')}`,
			});
		}

		if (char.books.length) {
			embed.fields.push({
				name: 'Books',
				value: char.books.map(b => `• ${b.name}`).join('\n'),
			});
		}

		if (char.allegiances.length) {
			embed.fields.push({
				name: 'Allegiances',
				value: char.allegiances.map(b => `• ${b.name}`).join('\n'),
			});
		}

		if (char.spouse) {
			const spouse = characters.find(s => s.id === char.spouse);
			if (spouse) {
				embed.fields.push({
					name: 'Spouse',
					value: `[${spouse.name}](https://awoiaf.westeros.org/index.php/${encodeURIComponent(spouse.name)})`,
				});
			}
		}

		if (char.playedBy) {
			embed.fields.push({
				name: 'Portrayed By',
				value: char.playedBy.join('\n'),
			});
		}

		if (char.culture) {
			embed.fields.push({
				name: 'Culture',
				value: char.culture,
			});
		}

		embed.fields.push({
			name: 'Gender',
			value: char.isFemale ? 'Female' : 'Male',
		});

		if (char.born) {
			embed.fields.push({
				name: 'Born',
				value: char.born,
			});
		}

		if (char.died) {
			embed.fields.push({
				name: 'Died',
				value: char.died,
			});
		}

		if (properties) {
			embed.url = `https://awoiaf.westeros.org/index.php/${encodeURIComponent(char.name)}`;
			// the request was successful so we have more info :^)
			const x = properties.find(p => p.name === 'description');
			if (x) {
				embed.description = this.Atlas.lib.utils.stripEntities(x['*'].substring(0, 1024))
					.replace(/\[[0-9]+\]/g, '');
			}

			const img = images.find(i => i.includes(char.name.split(' ')[0])) || images[0];
			if (img) {
				embed.thumbnail.url = `https://awoiaf.westeros.org/thumb.php?f=${img}&width=200`;
			}
		}

		// it can get pretty cancer unless the length thing is there
		if (embed.fields.length < 5 && char.aliases && char.aliases.length) {
			embed.fields.push({
				name: 'Aliases',
				value: char.aliases.map(a => `• ${a}`).join('\n'),
			});
		}

		embed.fields.forEach((f) => {
			f.inline = true;
		});

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'gotcharacter',
	aliases: [
		'gotc',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
