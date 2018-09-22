const Command = require('../../structures/Command.js');
const unformatted = require('./../../../lib/emojis.json');

const emojis = Object.values(unformatted).reduce((a, b) => a.concat(b), []);

const aliases = {
	gay: 'gay_pride_flag',
	safety: 'helmet_with_cross',
	laugh: 'laughing',
	haha: 'laughing',
	hah: 'laughing',
	lol: 'laughing',
};

module.exports = class Emojify extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('emojify.noArgs').send();
		}

		const converted = [];
		for (let arg of args) {
			arg = arg.toLowerCase();
			const replacement = emojis.find(e => e.names.includes(aliases[arg] || arg));
			converted.push(replacement ? replacement.surrogates : arg);
		}
		const str = converted.join(' ');

		return responder.localised(true).text(str).send();
	}
};

module.exports.info = {
	name: 'emojify',
	description: 'info.emojify.description',
	usage: 'info.emojify.usage',
	examples: [
		'tada',
	],
};
