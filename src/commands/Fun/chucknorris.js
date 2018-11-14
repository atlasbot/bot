const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class ChuckNorris extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { body } = await superagent.get('https://api.chucknorris.io/jokes/random');

		return responder.localised().text(body.value).send();
	}
};

module.exports.info = {
	name: 'chucknorris',
};
