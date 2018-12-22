const Command = require('../../structures/Command.js');

module.exports = class RandomCase extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'randomcase');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		let output = '';

		for (const char of args.join(' ')) {
			const type = this.Atlas.lib.utils.pickOne(['toUpperCase', 'toLowerCase']);

			output += char[type]();
		}

		return responder.localised().text(output).send();
	}
};

module.exports.info = {
	name: 'randomcase',
	aliases: ['rc'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
