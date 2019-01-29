const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (args.length >= 2 && isNaN(this.Atlas.lib.utils.parseNumber(args[1]))) {
			// chances are they did a typo and didn't mean to call this command, don't wanna accidently purge anything
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const num = this.Atlas.lib.utils.parseNumber(args[0], 100);

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		try {
			await msg.delete();
		} catch (e) {} // eslint-disable-line no-empty

		const purgeCount = await msg.channel.purge(num, m => !m.pinned);

		if (purgeCount === 0) {
			return responder.error('purge.base.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).ttl(5).send();
	}
};

module.exports.info = {
	name: 'purge',
	examples: [
		'10',
		'',
	],
	aliases: [
		'clean',
		'prune',
		'clear',
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
