const { Role, Message } = require('eris');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('id.noArgs').send();
		}

		if (this.Atlas.lib.utils.isSnowflake(args[0])) {
			return responder.text('id.alreadyASnowflake', msg.displayPrefix, args.shift()).send();
		}

		const replacements = {
			guild: msg.guild,
			me: msg.author,
		};

		let target;
		const query = args.join(' ').toLowerCase();
		if (replacements[query]) {
			target = replacements[query];
		}

		// try grab the id from a mention
		if (!target) {
			const id = this.Atlas.util.cleanID(query);

			if (id) {
				target = msg.guild.roles.get(id) || msg.guild.channels.get(id) || msg.guild.members.get(id);
			}
		}

		// try fuzzy find what they're on aboot
		if (!target) {
			target = (new this.Atlas.lib.structs.Fuzzy([
				...msg.guild.channels.values(),
				...msg.guild.roles.values(),
				...msg.guild.members.values(),
			], {
				keys: ['mention', 'id', 'name', 'tag', 'username', 'nickname'],
			})).search(query);
		}

		// when all our other options fail, look for a message that's "close enough"
		if (!target) {
			// search messages for the query
			target = this.Atlas.lib.utils.nbsFuzzy(msg.channel.messages, ['content'], query);
		}

		if (target) {
			if (target instanceof Role) {
				return responder.text('id.role', target.name, target.id).send();
			}

			if (target instanceof Message) {
				return responder.text('id.message', target.author.tag, target.id).send();
			}

			return responder.text('id.other', target.tag || target.mention || target.name, target.id).send();
		}

		return responder.error('id.noTarget', query).send();
	}
};

module.exports.info = {
	name: 'id',
	examples: [
		'@role',
		'#channel',
		'guild',
		'@user',
	],
	aliases: ['roleid', 'channelid', 'userid', 'snowflake'],
	guildOnly: true,
};
