const superagent = require('superagent');
const Command = require('../../structures/Command.js');

/* eslint-disable camelcase */

module.exports = class Urban extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('urban.noArgs').send();
		}

		const filter = this.Atlas.filters.get('cursing');

		if (!msg.channel.nsfw && filter.execute(args.join(' '))) {
			return responder.error('urban.nsfwWord').send();
		}

		const { body } = await superagent.get('http://api.urbandictionary.com/v0/define')
			.query({
				term: args.join(' '),
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (body.result_type === 'no_results') {
			return responder.error('urban.noResults', args.join(' '));
		}

		const { word, author, thumbs_up, thumbs_down, definition } = body.list.reduce((a, b) => {
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
	name: 'urban',
	aliases: ['dictionary', 'define'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
