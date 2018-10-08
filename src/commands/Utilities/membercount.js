const Command = require('../../structures/Command.js');

module.exports = class MemberCount extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		return responder.embed({
			fields: [{
				name: 'membercount.total',
				value: msg.guild.memberCount.toLocaleString(),
				inline: true,
			}, {
				name: 'membercount.online',
				value: msg.guild.members.filter(m => m.status === 'online').length.toLocaleString(),
				inline: true,
			}, {
				name: 'membercount.idle',
				value: msg.guild.members.filter(m => m.status === 'idle').length.toLocaleString(),
				inline: true,
			}, {
				name: 'membercount.dnd',
				value: msg.guild.members.filter(m => m.status === 'dnd').length.toLocaleString(),
				inline: true,
			}, {
				name: 'membercount.offline',
				value: msg.guild.members.filter(m => m.status === 'offline').length.toLocaleString(),
				inline: true,
			}, {
				name: 'membercount.bots',
				value: msg.guild.members.filter(m => m.bot).length.toLocaleString(),
				inline: true,
			}],
		}).send();
	}
};

module.exports.info = {
	name: 'membercount',
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
