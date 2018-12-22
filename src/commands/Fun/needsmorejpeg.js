const jimp = require('jimp');
const Command = require('../../structures/Command.js');

module.exports = class NeedsMoreJPEG extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'needsmorejpeg');

		const url = (msg.attachments[0] && msg.attachments[0].url) || args[0];

		if (!url) {
			return responder.error('noArgs').send();
		}

		if (!this.Atlas.lib.utils.isUri(url)) {
			return responder.error('invalidUrl', url).send();
		}

		const image = await jimp.read(url);

		let quality = 2.5;
		if (!isNaN(args[1])) {
			quality = Number(args[1]);
		}

		const buffer = await image.quality(quality).getBufferAsync(jimp.MIME_JPEG);

		return responder.file({
			file: buffer,
			name: `${new Date().getTime()}.png`,
		}).send();
	}
};

module.exports.info = {
	name: 'needsmorejpeg',
	aliases: ['jpeg', 'jpg', 'needsmorejpg', 'justfuckmyshitup'],
	permissions: {
		bot: {
			attachFiles: true,
		},
	},
};
