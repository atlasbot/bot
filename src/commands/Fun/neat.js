const Command = require('../../structures/Command.js');

module.exports = class Neat extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.reddit = new this.Atlas.lib.structs.Reddit(['interestingasfuck']);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const d = await this.reddit.getImage(msg.author.id);

		// people got triggered over the sub name being called "interestingasfuck"
		d.embed.footer.text = null;

		return responder.embed(d.embed).send();
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
