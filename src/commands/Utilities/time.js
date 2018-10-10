const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Time extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'time');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		const { body } = await superagent.get('https://query.yahooapis.com/v1/public/yql')
			.query({
				q: `select * from geo.places(1) where text="${args.join(' ')}"`,
				format: 'json',
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (!body.query.results || !body.query.results.place.timezone) {
			return responder.error('noTimezone', args.join(' ')).send();
		}

		const data = body.query.results.place;
		const tz = data.timezone.content;

		const formatter = new Intl.DateTimeFormat([], {
			timeZone: tz,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});

		const location = data.country ? `in ${data.name}, ${data.country.content}` : '';

		return responder.text('success', formatter.format(new Date()).toLocaleString(), location).send();
	}
};

module.exports.info = {
	name: 'time',
	aliases: ['timein', 'timeat', 'timezone', 'timefor'],
	examples: [
		'perth, australia',
	],
};
