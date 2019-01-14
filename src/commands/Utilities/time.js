const superagent = require('superagent');
const tzlookup = require('tz-lookup');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'time');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const { body: [location] } = await superagent.get('https://www.metaweather.com/api/location/search/')
			.query({
				query: args.join(' '),
			});

		if (!location) {
			return responder.error('noTimezone', args.join(' ')).send();
		}

		const tz = tzlookup(...location.latt_long.split(',').map(Number));

		const formatter = new Intl.DateTimeFormat([], {
			timeZone: tz,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});

		const country = tz.split('/').shift();
		const title = `in ${location.title}, ${country}`;

		return responder.text('success', formatter.format(new Date()).toLocaleString(), title).send();
	}
};

module.exports.info = {
	name: 'time',
	aliases: ['timein', 'timeat', 'timezone', 'timefor'],
	examples: [
		'perth, australia',
	],
};
