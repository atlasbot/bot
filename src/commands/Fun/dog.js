const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['dogpictures', 'lookatmydog', 'doggos', 'rarepuppers']);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { embed } = await this.reddit.getImage(msg.author.id);

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'dog',
	aliases: ['dogs'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
