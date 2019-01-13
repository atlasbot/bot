const superagent = require('superagent');
const tzlookup = require('tz-lookup');

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

		const { body: [location] } = await superagent.get('https://www.metaweather.com/api/location/search/')
			.query({
				query: args.join(' '),
			});

		if (!location) {
			return responder.error('noTimezone', args.join(' ')).send();
		}

		const [latt, long] = location.latt_long.split(',').map(Number);
		const tz = tzlookup(latt, long);

		// take lang/long and get times from open-notify.org
		const { body: { response } } = await superagent.get('http://api.open-notify.org/iss-pass.json')
			.set('User-Agent', this.Atlas.userAgent)
			.query({
				lat: latt,
				lon: long,
			});

		// make it all pweety
		const description = response.map(({ duration, risetime }) => {
			const time = new Date(risetime * 1000);
			const timeText = this.Atlas.lib.utils.timeFormat(time, true, tz);
			const durationText = this.Atlas.lib.utils.prettyMs(duration * 1000);

			// extra space is intentional, it looks better
			return responder.format('format', timeText, durationText);
		}).join('\n');

		return responder.embed({
			title: ['title', location.title],
			timestamp: new Date(),
			footer: {
				text: ['footer', location.title],
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
