const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		responder.text(`http://lmgtfy.com/?q=${args.map(encodeURIComponent).join('+')}`).send();
	}
};

module.exports.info = {
	name: 'lmgtfy',
	aliases: [
		'letmegooglethatforyou',
	],
};
