const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'weather');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const { body: [location] } = await superagent.get('https://www.metaweather.com/api/location/search/')
			.query({
				query: args.join(' '),
			});

		if (!location) {
			return responder.error('noResults').send();
		}

		const { body, body: { consolidated_weather: [weather] } } = await superagent.get(`https://www.metaweather.com/api/location/${location.woeid}/`);

		return responder.embed({
			title: ['title', body.title, body.parent.title],
			description: weather.weather_state_name,
			fields: [{
				name: 'temperature.name',
				value: ['temperature.value', weather.the_temp.toFixed(1), weather.min_temp.toFixed(1), weather.max_temp.toFixed(1)],
				inline: true,
			}, {
				name: 'humidity',
				value: `${weather.humidity}%`,
				inline: true,
			}, {
				name: 'wind.name',
				value: ['wind.value', (weather.wind_speed * 1.609).toFixed(1)],
				inline: true,
			}],
			timestamp: new Date(weather.created),
		}).send();
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
