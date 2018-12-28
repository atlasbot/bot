const Command = require('../../structures/Command.js');

const normal = ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const wide =	' ⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖǫʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾǫᴿˢᵀᵁⱽᵂˣʸᶻ';

module.exports = class SmallText extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'smalltext');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		let text = args.join(' ');

		for (let i = 0; i < normal.length; i++) {
			const char = normal[i];
			text = text.split(char).join(wide[i]);
		}

		return responder.localised(true).text(text).send();
	}
};

module.exports.info = {
	name: 'smalltext',
	aliases: ['superscript'],
};
