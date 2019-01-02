const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		responder.embed(this.helpEmbed(msg)).send();
	}
};

module.exports.info = {
	name: 'spacex',
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
