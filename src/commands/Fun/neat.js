const Command = require('../../structures/Command.js');

module.exports = class Neat extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['interestingasfuck']);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { embed } = await this.reddit.getImage(msg.author.id);

		// people got triggered over the sub name being called "interestingasfuck"
		embed.footer.text = null;

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'neat',
	aliases: ['iaf'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
