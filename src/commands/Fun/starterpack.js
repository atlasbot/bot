const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['starterpacks']);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { embed } = await this.reddit.getImage(msg.author.id);

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'starterpack',
	aliases: ['sp'],
	pemrissions: {
		bot: {
			embedLinks: true,
		},
	},
};
