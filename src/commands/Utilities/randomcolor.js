const Command = require('../../structures/Command.js');

module.exports = class RandomColor extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const hex = Math.random().toString(16).slice(2, 8);

		return responder.embed({
			description: ['randomcolor', hex],
			color: parseInt(hex, 16),
		}).send();
	}
};

module.exports.info = {
	name: 'randomcolor',
	aliases: ['randomhex', 'rhex', 'rcolor', 'rh', 'hex', 'randomcolour', 'rcolour'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
