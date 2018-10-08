const superagent = require('superagent');
const Command = require('../../structures/Command.js');


module.exports = class Wiki extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('You have to include a search term!').send();
		} if (args.join(' ').length > 200) {
			return responder.error('Your search term must be under 200 characters!').send();
		}

		// this api isn't really meant to be used for this
		superagent.get('https://en.wikipedia.org/w/api.php')
			.query({
				action: 'opensearch',
				format: 'json',
				formatversion: '2',
				search: args.join(' '),
				namespace: '0',
				limit: '1',
				suggest: true,
			})
			.then((res) => {
				const [query, [title], [description], [url]] = res.body;
				if (!title) {
					return responder.error('I could not find any wiki article matching your search term!').send();
				}

				return responder.embed({
					title,
					url,
					description: `${description.replace(/\((.*)\)/, '').trim()} [Wiki Page](${url})`,
					timestamp: new Date(),
					footer: {
						text: `You searched for "${query}"`,
					},
				}).send();
			})
			.catch(() => responder.error('general.restError').send());
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
