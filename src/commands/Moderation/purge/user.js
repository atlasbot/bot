const Command = require('../../../structures/Command.js');

module.exports = class User extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const target = await this.Atlas.util.findMember(msg.guild, args[0]);

		if (!target) {
			return responder.error('purge.user.noUser').send();
		}


		const num = this.Atlas.lib.utils.parseNumber(args[1], 100);

		if (num < 1) {
			return responder.text('purge.general.tooLow').send();
		}

		if (num > 100) {
			return responder.text('purge.general.tooHigh').send();
		}

		await msg.delete();

		const purgeCount = await msg.channel.purge(num, m => !m.pinned && m.author.id === target.id);

		if (purgeCount === 0) {
			return responder.error('purge.general.nothingPurged', msg.author.mention).send();
		}

		return responder.error('purge.general.success', msg.author.mention, purgeCount).ttl(5).send();
	}
};

module.exports.info = {
	name: 'user',
	examples: [
		'@random 10',
		'@user',
	],
	aliases: [
		'member',
		'from',
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
