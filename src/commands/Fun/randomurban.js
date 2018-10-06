const superagent = require('superagent');
const Command = require('../../structures/Command.js');

/* eslint-disable camelcase */

module.exports = class RandomUrban extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);


		const { body } = await superagent.get('http://api.urbandictionary.com/v0/random')
			.query({
				term: args.join(' '),
			});

		const filter = this.Atlas.filters.get('cursing');

		// try and filter down to no nsfw posts
		const filtered = msg.channel.nsfw ? body.list : body.list.filter(({ definition }) => !filter.execute(definition));

		const { word, author, thumbs_up, thumbs_down, definition } = (filtered.length ? filtered : body.list).reduce((a, b) => {
			if ((a.thumbs_up - a.thumbs_down) > (b.thumbs_up - b.thumbs_down)) {
				return a;
			}

			return b;
		});


		if (!msg.channel.nsfw && filter.execute(definition)) {
			return responder.error('urban.nsfwDef').send();
		}

		return responder.embed({
			title: word,
			description: definition.replace(/\[|\]/g, '').substring(0, 2048),
			url: `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(word)}`,
			fields: [{
				name: 'urban.author.name',
				value: `[${author}](https://www.urbandictionary.com/author.php?author=${encodeURIComponent(author)})`,
			}],
			footer: {
				text: ['urban.votes', thumbs_up, thumbs_down],
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
