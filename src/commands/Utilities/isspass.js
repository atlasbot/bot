const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'isspass');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		// use yahoo yql to get laitude/longitude, a location name and timezone
		const { body: { query: { results } } } = await superagent.get('https://query.yahooapis.com/v1/public/yql')
			.set('User-Agent', this.Atlas.userAgent)
			.query({
				// todo: you can probably inject yql here
				q: `select centroid, name, timezone from geo.places(1) where text="${args.join(' ')}"`,
				format: 'json',
			});

		if (!results) {
			return responder.error('noResults', args.join(' ')).send();
		}

		const { centroid, name, timezone: { content: timezone } } = results.place;

		// take lang/long and get times from open-notify.org
		const { body: { response } } = await superagent.get('http://api.open-notify.org/iss-pass.json')
			.set('User-Agent', this.Atlas.userAgent)
			.query({
				lat: centroid.latitude,
				lon: centroid.longitude,
			});

		// make it all pweety
		const description = response.map(({ duration, risetime }) => {
			const time = new Date(risetime * 1000);
			const timeText = this.Atlas.lib.utils.timeFormat(time, true, timezone);
			const durationText = this.Atlas.lib.utils.prettyMs(duration * 1000);

			// extra space is intentional, it looks better
			return responder.format('format', timeText, durationText);
		}).join('\n');

		return responder.embed({
			title: ['title', name],
			timestamp: new Date(),
			footer: {
				text: ['footer', name],
			},
			description,
		}).send();
	}
};

module.exports.info = {
	name: 'isspass',
	examples: [
		'perth',
		'america',
		'new york',
	],
	aliases: [
		'isspasses',
		'isspassover',
		'issover',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
