const { Role, Channel } = require('eris');
const Command = require('../../structures/Command.js');

module.exports = class ID extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args.length) {
			return responder.error('id.noArgs').send();
		}

		const replacements = {
			guild: msg.guild,
			me: msg.author,
		};

		let target;
		const query = args.shift().toLowerCase();
		if (replacements[query]) {
			target = replacements[query];
		} else {
			const id = this.Atlas.util.cleanID(query);
			if (id) {
				target = msg.guild.roles.get(id) || msg.guild.channels.get(id) || msg.guild.members.get(id);
			}

			if (!target) {
				target = (new this.Atlas.lib.structs.Fuzzy([
					...msg.guild.channels.values(),
					...msg.guild.roles.values(),
					...msg.guild.members.values(),
				], {
					keys: ['mention', 'id', 'name', 'tag', 'username', 'nickname'],
				})).search(query);
			}
		}

		if (target) {
			if (target instanceof Role) {
				return responder.text('id.role', target.name, target.id).send();
			}

			if (target instanceof Channel) {
				return responder.text('id.channel', target.mention, target.id).send();
			}

			return responder.text('id.memberOrGuild', target.tag || target.name, target.id).send();
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
	aliases: ['roleid', 'channelid', 'userid'],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
