const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class DadJoke extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { body } = await superagent.get('https://icanhazdadjoke.com/');

		return responder.localised().text(body.joke).send();
	}
};

module.exports.info = {
	name: 'dadjoke',
};
