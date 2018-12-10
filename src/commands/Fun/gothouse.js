const superagent = require('superagent');

const Command = require('../../structures/Command.js');

const characters = require('./../../../data/gameOfThrones/characters.json');
const houses = require('./../../../data/gameOfThrones/houses.json');

module.exports = class GotHouse extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const h = args[0] ? (new this.Atlas.lib.structs.Fuzzy(houses.map((house) => {
			// House Stark of Winterfell > Stark, makes fuzzy search work better-er
			house.cleanerName = house.name.replace(/of [A-z ]+/g, '').split('House').join(' ');

			return house;
		}), {
			keys: ['cleanerName', 'name', 'id', 'coatOfArms'],
		})).search(args.join(' ')) : this.Atlas.lib.utils.pickOne(houses);

		if (!h) {
			return responder.error('gotcharacter.notFound', args.join(' ')).send();
		}

		const house = {
			...h,
			founder: characters.find(c => c.id === h.founder),
			currentLord: characters.find(c => c.id === h.currentLord),
			overlord: characters.find(c => c.id === h.overlord),
			heir: characters.find(c => c.id === h.heir),
		};

		const name = /.+?(?= of)/i.exec(house.name);
		const d = (await superagent.get('https://awoiaf.westeros.org/api.php')
			.query({
				action: 'parse',
				page: name ? name[0].trim() : house.name,
				format: 'json',
			})
			.set('User-Agent', this.Atlas)).body;

		let images;
		let properties;

		if (!d.error) {
			({ properties, images } = d.parse);
		}

		const embed = {
			title: house.name,
			thumbnail: {
				url: null,
			},
			fields: [{
				name: 'Region',
				value: house.region,
				inline: true,
			}],
			footer: {
				text: `House ${house.id}`,
			},
			timestamp: new Date(),
		};

		// chances are the image is the coat of arms anyway
		if (house.coatOfArms && !images) {
			embed.fields.unshift({
				name: 'Coat of Arms',
				value: house.coatOfArms,
			});
		}

		if (house.founded) {
			embed.fields.push({
				name: 'Founded',
				value: house.founded,
				inline: true,
			});
		}

		if (house.region) {
			embed.fields.push();
		}

		if (house.words) {
			embed.fields.push({
				name: 'Words',
				value: house.words,
				inline: true,
			});
		}

		if (house.seats) {
			embed.fields.push({
				name: 'Seats',
				value: house.seats.join('\n'),
				inline: true,
			});
		}

		const charurl = n => `[${n}](https://awoiaf.westeros.org/index.php/${encodeURIComponent(n)})`;

		if (house.currentLord) {
			embed.fields.push({
				name: 'Current Lord',
				value: charurl(house.currentLord.name),
				inline: true,
			});
		}

		if (house.founder) {
			embed.fields.push({
				name: 'Founder',
				value: charurl(house.founder.name),
				inline: true,
			});
		}

		if (house.heir) {
			embed.fields.push({
				name: 'Heir',
				value: charurl(house.heir.name),
				inline: true,
			});
		}

		if (properties) {
			embed.url = `https://awoiaf.westeros.org/index.php/${encodeURIComponent(house.name)}`;
			// the request was successful so we have more info :^)
			const x = properties.find(p => p.name === 'description');
			if (x) {
				embed.description = this.Atlas.lib.utils.stripEntities(x['*'].substring(0, 1024))
					.replace(/\[[0-9]+\]/g, '');
			}

			if (images.length) {
				embed.thumbnail.url = `https://awoiaf.westeros.org/thumb.php?f=${images[0]}&width=200`;
			}
		}

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'gothouse',
	aliases: [
		'goth',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
