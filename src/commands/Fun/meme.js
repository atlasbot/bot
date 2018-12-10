const Command = require('../../structures/Command.js');

module.exports = class Meme extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['wholesomememes', 'dankmemes', 'memes']);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { embed } = await this.reddit.getImage(msg.author.id);

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'meme',
	aliases: ['meyme', 'me-me', 'mmmlol'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
