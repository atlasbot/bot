const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class trumpgen extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.cache = new Map();
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const cleanArgs = msg.cleanContent.split(/ +/g);
		cleanArgs.shift();
		const text = cleanArgs.join(' ');

		if (!args[0]) {
			return responder.error('You have to include text to mangle!').send();
		}

		if (this.cache.has(text)) {
			return responder.embed(text).send();
		}

		const res = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'trumpgen',
				text,
			});
		const embed = {
			image: {
				url: res.body.message,
			},
			footer: {
				text: 'Powered by the nekobot.xyz API',
			},
		};
		responder.embed(embed).send();
		this.cache.set(text, embed);
		setTimeout(() => {
			this.cache.delete(text);
		}, 30 * 60 * 1000);
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
