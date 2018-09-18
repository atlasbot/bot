const Command = require('../../structures/Command.js');

module.exports = class DadJoke extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.prefetcher = new this.Atlas.lib.structs.Prefetcher({
			url: 'https://icanhazdadjoke.com/',
		});
		this.prefetcher.init();
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const res = await this.prefetcher.get();

		return responder.localised(true).text(res.body.joke).send();
	}
};

module.exports.info = {
	name: 'dadjoke',
	description: 'info.dadjoke.description',
};
