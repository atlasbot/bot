const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class trumpgen extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.cache = new Map();
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
		cleanArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('You have to include text to mangle!').send();
		}

		const text = cleanArgs.join(' ');

		if (this.cache.has(text)) {
			return responder.embed(text).send();
		}

		const { body } = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'trumptweet',
				text,
			});

		const embed = {
			image: {
				url: body.message,
			},
			footer: {
				text: 'Powered by the nekobot.xyz API',
			},
		};

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'trumpgen',
	description: 'info.trumpgen.description',
	aliases: [
		'trumpt',
	],
	examples: [
		'WOW! Atlas has a trumpgen command. SAD!',
		'The beauty of me is that I\'m very rich.',
		'I think I am, actually humble. I think I\'m much more humble than you would understand.',
		'All of the women on \'The Apprentice\' flirted with me—consciously or unconsciously. That\'s to be expected.',
	],
	usage: 'info.trumpgen.usage',
};
