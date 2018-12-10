const Command = require('../../structures/Command.js');

module.exports = class Emojify extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('emojify.noArgs').send();
		}

		const converted = [];
		for (const x of args) {
			const arg = x.replace().replace(/\W/g, '').toLowerCase();
			const emoji = this.Atlas.lib.emoji.get(arg);
			if (emoji) {
				converted.push(emoji.char);
			} else {
				converted.push(x);
			}
		}

		const str = converted.join(' ');

		return responder.localised().text(str).send();
	}
};

module.exports.info = {
	name: 'emojify',
	examples: [
		'tada',
	],
};
