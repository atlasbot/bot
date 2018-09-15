const Command = require('../../structures/Command.js');

module.exports = class EightBall extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const random = this.Atlas.lib.utils.pickOne(['heads', 'tails']);

		return responder.text(`coinflip.${random}`).send();
	}
};

module.exports.info = {
	name: 'coinflip',
	description: 'info.coinflip.description',
	aliases: [
		'flip',
		'cflip',
	],
};
