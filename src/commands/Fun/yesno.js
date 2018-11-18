const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class YesNo extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { body } = await superagent.get('https://yesno.wtf/api');

		return responder.localised().embed({
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
