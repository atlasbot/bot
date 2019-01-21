const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		override,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'movie');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const { body } = await superagent.get('https://private.omdbapi.com')
			.query({
				t: args.join(' '),
				detail: 'full',
				apiKey: process.env.OMDBAPI_KEY,
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (body.Error) {
			if (body.Error.includes('not found!')) {
				return responder.error('notFound', args.join(' ')).send();
			}

			throw new Error(body.Error);
		}

		if (!override && body.Type !== 'movie') {
			return responder.error('notAMovie', msg.displayPrefix, args.join(' ')).send();
		} if (override && body.Type !== 'series') {
			return responder.error('notASeries', msg.displayPrefix, args.join(' ')).send();
		}

		const embed = {
			title: body.Title,
			description: [body.Plot, body.Awards].filter(x => x).join('\n') || null,
			url: body.Website !== 'N/A' && body.Website,
			fields: [
				{
					name: 'ratings',
					value: body.Ratings.map(r => `${r.Value} - ${r.Source}`).join('\n'),
					inline: true,
				}, {
					name: 'Actors',
					value: body.Actors.split(',').join('\n'),
					inline: true,
				}, {
					name: 'Language',
					value: body.Language,
					inline: true,
				}, {
					name: 'Genre',
					value: body.Genre,
					inline: true,
				}, {
					name: 'Runtime',
					value: body.Runtime,
					inline: true,
				}, {
					name: 'Directors',
					value: body.Director,
					inline: true,
				}, {
					name: 'Rated',
					value: body.Rated,
					inline: true,
				},
				// omdb doesn't use null or even booleans
				// nice
			].filter(f => f.value !== 'N/A'),
			thumbnail: {
				url: this.Atlas.lib.utils.isUri(body.Poster) && body.Poster,
			},
			footer: {
				text: 'Released',
			},
			timestamp: new Date(body.Released),
		};

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'movie',
	aliases: ['movieinfo', 'moviesearch', 'moviedetails', 'imbdb', 'omdb'],
	examples: [
		'infinity war',
		'the avengers',
		'justice league',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
