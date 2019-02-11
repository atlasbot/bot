const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'ticket.close');

		const ticket = await this.Atlas.DB.getTicket(msg.guild, msg.channel.id);

		if (!ticket) {
			return responder.error('commands.ticket.base.notATicket').send();
		}

		const options = settings.plugin('tickets');
		const authorPerms = msg.channel.permissionsOf(msg.author.id);
		if (ticket.author !== msg.author.id && !authorPerms.has('manageGuild') && !(msg.member.roles || []).includes(options.support)) {
			return responder.error('commands.ticket.base.noPerms').send();
		}

		await msg.channel.delete();

		await this.Atlas.DB.deleteTicket(msg.guild.id, msg.channel.id);
	}
};

module.exports.info = {
	name: 'close',
	guildOnly: true,
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
