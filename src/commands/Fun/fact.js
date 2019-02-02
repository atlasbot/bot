const Command = require('../../structures/Command.js');
const facts = require('../../data/facts.json');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const fact = this.Atlas.lib.utils.pickOne(facts);

		return responder.localised().text(fact).send();
	}
};

module.exports.info = {
	name: 'fact',
};
