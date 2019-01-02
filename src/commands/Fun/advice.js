const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const res = await superagent.get('http://api.adviceslip.com/advice');

		const { slip: { advice } } = JSON.parse(res.text);

		return responder.localised().text(advice).send();
	}
};

module.exports.info = {
	name: 'advice',
};
