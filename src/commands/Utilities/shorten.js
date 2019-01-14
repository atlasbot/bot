const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'shorten');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		const url = args.join(' ');
		if (!this.Atlas.lib.utils.isUri(url)) {
			return responder.error('invalidURI', url).send();
		}

		const { text } = await superagent.get('https://is.gd/create.php')
			.query({
				format: 'json',
				url,
			})
			.set('User-Agent', this.Atlas.userAgent);

		const body = JSON.parse(text);

		return responder.localised().text(`<${body.shorturl}>`).send();
	}
};

module.exports.info = {
	name: 'shorten',
};
