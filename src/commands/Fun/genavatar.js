const Command = require('../../structures/Command.js');

// note: at the time of making this, adorable.io is getting 503'd
// it should work because this is a direct copy from v7, but still

module.exports = class GenAvatar extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const id = Date.now();
		const url = quality => `https://api.adorable.io/avatars/${quality}/${id}.png`;

		return responder.embed({
			title: 'genavatar.title',
			description: ['genavatar.description', url(800)],
			image: {
				url: url(200),
			},
			footer: {
				text: 'genavatar.footer',
			},
			timestamp: new Date(id),
		}).send();
	}
};

module.exports.info = {
	name: 'genavatar',
	aliases: ['generateavatar', 'randavatar', 'randomavatar'],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
