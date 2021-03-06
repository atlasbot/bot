const jimp = require('jimp');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'needsmorejpeg');

		let url = (msg.attachments[0] && msg.attachments[0].url) || args[0];
		if (!url || !this.Atlas.lib.utils.isUri(url)) {
			// search messages over the last 15s for attachments/links
			// not 100% sure about this yet but /shrug
			for (const m of msg.channel.messages.filter(x => (Date.now() - x.timestamp) < 15000)) {
				if (this.Atlas.lib.utils.isUri(m.content)) {
					url = m.content;

					if (url) {
						break;
					}
				}

				const attachment = m.attachments.find(a => a.url && a.height);

				if (attachment) {
					url = attachment.proxy_url || attachment.url;
				}

				if (url) {
					break;
				}
			}
		}

		if (!url) {
			return responder.error('noArgs').send();
		}

		if (!this.Atlas.lib.utils.isUri(url)) {
			return responder.error('invalidUrl', url).send();
		}

		try {
			let quality = this.Atlas.lib.utils.parseNumber(args[1]);
			if (isNaN(quality)) {
				quality = 2.5;
			}

			const image = await jimp.read(url);

			const buffer = await image.quality(quality).getBufferAsync(jimp.MIME_JPEG);

			return responder.file({
				file: buffer,
				name: `${new Date().getTime()}.png`,
			}).send();
		} catch (e) {
			if (e.message.includes('Could not find MIME')) {
				return responder.text('notAnImage').send();
			}

			throw e;
		}
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
	examples: [
		'https://i.imgur.com/6zaldnc.jpg',
	],
};
