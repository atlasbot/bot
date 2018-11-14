const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Advice extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const res = await superagent.get('http://api.adviceslip.com/advice');
		const body = JSON.parse(res.body);

		return responder.localised().text(body.slip.advice).send();
	}
};

module.exports.info = {
	name: 'advice',
};
