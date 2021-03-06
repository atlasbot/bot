const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('texttoemoji.noArgs').send();
		}

		const { emojiNumbers } = this.Atlas.constants;

		return responder
			.localised()
			.text(
				args.join('   ')
					.replace(/[A-z]/g, m => `:regional_indicator_${m.toLowerCase()}:`)
					.replace(/[0-9]/g, n => (emojiNumbers[n] ? `:${emojiNumbers[n]}:` : n))
					.split('!')
					.join('❕')
					.split('?')
					.join('❔')
					.substring(0, 2000),
			)
			.send();
	}
};

module.exports.info = {
	name: 'texttoemoji',
	aliases: ['tte'],
	examples: [
		'l33t',
		'ayy lmao',
		'im sure the server admins will love this',
	],
};
