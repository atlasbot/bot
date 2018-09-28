const Command = require('../../structures/Command.js');

module.exports = class Meme extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['wholesomememes', 'dankmemes', 'memes']);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const d = await this.reddit.getImage(msg.author.id);

		return responder.embed(d.embed).send();
	}
};

module.exports.info = {
	name: 'meme',
	aliases: ['meyme', 'me-me', 'mmmlol'],
};
