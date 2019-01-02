const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { body } = await superagent.get('https://cat-fact.herokuapp.com/facts/random');

		return responder.localised().text(body.text).send();
	}
};

module.exports.info = {
	name: 'catfact',
};
