const Command = require('../../../structures/Command.js');

module.exports = class Purge extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (args.length >= 2 && isNaN(args[1])) {
			// chances are they did a typo and didn't mean to call this command
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const num = isNaN(args[0]) ? 100 : Number(args[0]);

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		await msg.delete();

		const purgeCount = await msg.channel.purge(num, m => !m.pinned);

		if (purgeCount === 0) {
			return responder.error('purge.base.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).send();
	}
};

module.exports.info = {
	name: 'purge',
	examples: [
		'10',
		'',
	],
	aliases: [
		'prune',
		'clear',
	],
	permissions: {
		user: {
			embedLinks: true,
			manageMessages: true,
		},
		bot: {
			manageMessages: true,
		},
	},
	guildOnly: true,
};
