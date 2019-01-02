const superagent = require('superagent');
const Command = require('../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'wiki');

		if (!args.length) {
			return responder.error('noArgs').send();
		} if (args.join(' ').length > 64) {
			return responder.error('tooLong').send();
		}

		const { body } = await superagent.get('https://en.wikipedia.org/w/api.php')
			.query({
				action: 'opensearch',
				format: 'json',
				formatversion: '2',
				search: args.join(' '),
				namespace: '0',
				limit: '1',
				suggest: true,
			})
			.set('User-Agent', this.Atlas.userAgent);

		const [query, [title], [description], [url]] = body;
		if (!title) {
			return responder.error('noResults').send();
		}

		return responder.embed({
			title,
			url,
			description: ['description', description.replace(/\((.*)\)/, '').trim(), url],
			timestamp: new Date(),
			footer: {
				text: ['footer', query],
			},
		}).send();
	}
};

module.exports.info = {
	name: 'wiki',
	examples: [
		'autism',
		'cancer',
		'trump',
		'bad jokes',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
