const Command = require('../../../structures/Command.js');

module.exports = class Images extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const num = isNaN(args[0]) ? 100 : Number(args[0]);

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		await msg.delete();

		// According to API docs, 'height' is only set if it's an image.
		const purgeCount = await msg.channel.purge(num, m => !m.pinned && m.attachments.filter(a => a.height).length !== 0);

		if (purgeCount === 0) {
			return responder.error('purge.general.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).send();
	}
};

module.exports.info = {
	name: 'images',
	examples: [
		'10',
		'',
	],
	aliases: [
		'img',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			manageMessages: true,
		},
	},
	guildOnly: true,
};
