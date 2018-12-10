const superagent = require('superagent');
const Command = require('../../structures/Command.js');
const lib = require('./../../../lib');

module.exports = class Weather extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}
		const unit = 'c';

		superagent.get('https://query.yahooapis.com/v1/public/yql?')
			.set('User-Agent', this.Atlas.userAgent)
			.query({
				q: `select * from weather.forecast where u='${unit}' AND woeid in (select woeid from geo.places(1) where text="${args.join(' ')}")`,
				format: 'json',
			})
			.end((err, res) => {
				if (err || !lib.utils.getNested(res, 'body.query.results.channel.location.city')[0]) {
					return responder.error('I couldn\'t find weather information matching your query.').send();
				}
				const weather = res.body.query.results.channel;

				return responder.embed({
					author: {
						name: `Weather information for ${weather.location.city}, ${weather.location.country}`,
					},
					description: `${weather.location.city} is currently sitting at ${weather.item.condition.temp}°${weather.units.temperature} `,
					fields: [{
						name: 'Humidity',
						value: `${weather.atmosphere.humidity}% Humidity`,
						inline: true,
					}, {
						name: 'Wind Speed',
						value: `${weather.wind.speed} ${weather.units.speed}`,
						inline: true,
					}],
					timestamp: new Date(),
				}).send();
			});
	}
};

module.exports.info = {
	name: 'weather',
	examples: [
		'perth',
		'america',
		'new york',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
