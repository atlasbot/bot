const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Shorten extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'shorten');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		if (!this.Atlas.lib.utils.isUri(args[0])) {
			return responder.error('invalidURI', args[0]).send();
		}

		const { text } = await superagent.get('https://is.gd/create.php')
			.query({
				format: 'json',
				url: args[0],
			})
			.set('User-Agent', this.Atlas.userAgent);

		const body = JSON.parse(text);

		return responder.localised().text(`<${body.shorturl}>`).send();
	}
};

module.exports.info = {
	name: 'shorten',
};
