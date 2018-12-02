const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Movie extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
		override,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'movie');

		if (!args[0]) {
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
			throw new Error(body.Error);
		}

		if (!override && body.Type !== 'movie') {
			return responder.error('movie.notAMovie', msg.displayPrefix, args.join(' ')).send();
		} if (override && body.Type !== 'series') {
			return responder.error('movie.notASeries', msg.displayPrefix, args.join(' ')).send();
		}

		const embed = {
			title: body.Title,
			description: [body.Plot, body.Awards].filter(x => x).join('\n') || null,
			url: body.Website !== 'N/A' ? body.Website : null,
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
					name: 'Released',
					value: (new Date(body.Released)).toLocaleDateString(),
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
			],
			thumbnail: {
				url: body.Poster,
			},
			timestamp: new Date(),
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
