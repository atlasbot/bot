const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class DadJoke extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { body: { joke } } = await superagent.get('https://icanhazdadjoke.com/')
			.set('Accept', 'application/json');

		return responder.localised().text(joke).send();
	}
};

module.exports.info = {
	name: 'dadjoke',
};
