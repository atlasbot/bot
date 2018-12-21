const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class trumpgen extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		cleanArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('You have to include text to mangle!').send();
		}

		const text = cleanArgs.join(' ');

		const { body } = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'trumptweet',
				text,
			})
			.set('User-Agent', this.Atlas.userAgent);

		const embed = {
			image: {
				url: body.message,
			},
			footer: {
				text: 'general.poweredBy.nekobot',
			},
		};

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'trumpgen',
	aliases: [
		'trumpt',
	],
	examples: [
		'WOW! Atlas has a trumpgen command. SAD!',
		'The beauty of me is that I\'m very rich.',
		'I think I am, actually humble. I think I\'m much more humble than you would understand.',
		'All of the women on \'The Apprentice\' flirted with me—consciously or unconsciously. That\'s to be expected.',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
