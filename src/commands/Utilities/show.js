const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Show extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const { body } = await superagent.get('https://private.omdbapi.com')
			.query({
				t: args.join(' '),
				detail: 'full',
				apiKey: process.env.OMDBAPI_KEY,
			});

		if (body.Error) {
			throw new Error(body.Error);
		}

		if (body.Type !== 'series') {
			return responder.error('series.notASeries', msg.displayPrefix, args.join(' ')).send();
		}

		const embed = {
			title: body.Title,
			description: body.Plot += body.Awards !== 'N/A' ? `\n\n${body.Awards}` : '',
			url: body.Website !== 'N/A' ? body.Website : null,
			fields: [
				{
					name: 'Ratings',
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

		// TODO: add reactions for every season :D
		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'show',
	aliases: ['showinfo', 'showsearch', 'showdetails'],
	examples: [
		'westworld',
		'game of thrones',
	],
};
