const Command = require('../../structures/Command.js');

module.exports = class YesNo extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.prefetcher = new this.Atlas.lib.structs.Prefetcher({
			url: 'https://yesno.wtf/api',
		});
		this.prefetcher.init();
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);
		const { body } = await this.prefetcher.get();

		return responder.localised(true).embed({
			title: this.Atlas.lib.utils.capitalize(body.answer),
			image: {
				url: body.image,
			},
			timestamp: new Date(),
			footer: {
				text: 'Via yesno.wtf',
			},
		}).send();
	}
};

module.exports.info = {
	name: 'yesno',
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
