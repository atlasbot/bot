const Command = require('../../../structures/Command.js');

module.exports = class Invites extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const num = !isFinite(args[0]) ? 100 : Number(args[0]);

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		await msg.delete();

		const inviteFilter = this.Atlas.filters.get('invites');

		const purgeCount = await msg.channel.purge(num, m => !m.pinned && (inviteFilter.execute(m.content) || inviteFilter.execute(m.cleanContent)));

		if (purgeCount === 0) {
			return responder.error('purge.general.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).send();
	}
};

module.exports.info = {
	name: 'invites',
	examples: [
		'10',
		'',
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
