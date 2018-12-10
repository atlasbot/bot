const Command = require('../../../structures/Command.js');

module.exports = class Includes extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { num, cleanedArgs } = this.Atlas.lib.utils.getArgNumber(args, {
			defaultNumber: 100,
		});

		if (!cleanedArgs[0]) {
			return responder.error('purge.general.invalidFilter').send();
		}

		const pattern = cleanedArgs.join(' ');

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		await msg.delete();

		const purgeCount = await msg.channel.purge(num, m => !m.pinned && (
			this.Atlas.lib.utils.wildcard.match(pattern, m.cleanContent)
            || this.Atlas.lib.utils.wildcard.match(pattern, m.content)
		));

		if (purgeCount === 0) {
			return responder.error('purge.general.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).send();
	}
};

module.exports.info = {
	name: 'includes',
	examples: [
		'xd rawr 10',
		'rawr',
		'rawr*xd',
		'a*z',
		'10',
	],
	aliases: [
		'matching',
		'match',
		'including',
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
