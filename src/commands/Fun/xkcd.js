const superagent = require('superagent');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'xkcd');

		const min = 1;
		const { body: { num } } = await superagent.get('https://xkcd.com/info.0.json')
			.set('User-Agent', this.Atlas.userAgent);

		const comicNum = this.Atlas.lib.utils.parseNumber(args.join(' '), (Math.floor(Math.random() * num) + 1));

		if (comicNum < min || comicNum > num) {
			return responder.error('invalidNumber', num).send();
		}


		const { body } = await superagent.get(`https://xkcd.com/${comicNum}/info.0.json`)
			.set('User-Agent', this.Atlas.userAgent);

		return responder.embed({
			title: body.safe_title,
			url: `https://xkcd.com/${comicNum}/`,
			description: body.alt,
			image: {
				url: body.img,
			},
			timestamp: new Date(body.year, body.month, body.day),
			footer: {
				text: ['footer', comicNum.toLocaleString()],
			},
		}).send();
	}
};

module.exports.info = {
	name: 'xkcd',
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
	examples: [
		'',
		'23',
	],
};
