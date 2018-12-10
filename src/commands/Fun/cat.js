const Command = require('../../structures/Command.js');

module.exports = class Cat extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['kitten', 'cats', 'catpics', 'catpictures']);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const d = await this.reddit.getImage(msg.author.id);

		return responder.embed(d.embed).send();
	}
};

module.exports.info = {
	name: 'cat',
	aliases: ['cats', 'kitten', 'kittens'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
