const Command = require('../../structures/Command.js');

module.exports = class Advice extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.prefetcher = new this.Atlas.lib.structs.Prefetcher({
			url: 'http://api.adviceslip.com/advice',
		});
		this.prefetcher.init();
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const res = await this.prefetcher.get();
		const body = JSON.parse(res.body);

		return responder.localised(true).text(body.slip.advice).send();
	}
};

module.exports.info = {
	name: 'advice',
};
