const superagent = require('superagent');
const swearjar = require('swearjar');

const Command = require('../../structures/Command.js');

/* eslint-disable camelcase */

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'urban');


		const { body } = await superagent.get('http://api.urbandictionary.com/v0/random')
			.query({
				term: args.join(' '),
			})
			.set('User-Agent', this.Atlas.userAgent);
		const filtered = msg.channel.nsfw ? body.list : body.list.filter(({ definition }) => !swearjar.profane(definition));

		const { word, author, thumbs_up, thumbs_down, definition } = (filtered.length ? filtered : body.list).reduce((a, b) => {
			if ((a.thumbs_up - a.thumbs_down) > (b.thumbs_up - b.thumbs_down)) {
				return a;
			}

			return b;
		});


		if (!msg.channel.nsfw && swearjar.profane(definition)) {
			return responder.error('nsfwDef').send();
		}

		return responder.embed({
			title: word,
			description: definition.replace(/\[|\]/g, '').substring(0, 2048),
			url: `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(word)}`,
			fields: [{
				name: 'author',
				value: `[${author}](https://www.urbandictionary.com/author.php?author=${encodeURIComponent(author)})`,
			}],
			footer: {
				text: ['votes', thumbs_up, thumbs_down],
			},
			timestamp: new Date(),
		}).send();
	}
};

module.exports.info = {
	name: 'randomurban',
	aliases: ['randurban', 'rurban'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
