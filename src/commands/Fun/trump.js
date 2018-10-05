const Command = require('../../structures/Command.js');
const quotes = require('./../../../data/trump/quotes.json');

module.exports = class Advice extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const quote = this.Atlas.lib.utils.pickOne(quotes);

		return responder.localised(true).text(quote).send();
	}
};

module.exports.info = {
	name: 'trump',
};
