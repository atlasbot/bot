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
			return responder.error('This is not a ticket channel.').send();
		}

		const options = settings.plugin('tickets');
		const authorPerms = msg.channel.permissionsOf(msg.author.id);
		if (ticket.author !== msg.author.id && !authorPerms.has('manageGuild') && !(msg.member.roles || []).includes(options.support)) {
			return responder.error('You do not have permission to do that.').send();
		}

		if (!args.length) {
			return responder.error('Please include a user to remove.').send();
		}

		const member = await settings.findUser(args.join(' '), {
			memberOnly: true,
		});

		if (!member) {
			return responder.error('I could not find a member in this guild matching your query').send();
		}

		const perms = msg.channel.permissionsOf(member.id);
		if (!perms.has('sendMessages')) {
			return responder.error(`${member.username} doesn't have permission to view this ticket.`).send();
		}

		await msg.channel.deletePermission(member.id);

		return responder.text(`${member.mention} can no longer view this ticket.`).send();
	}
};

module.exports.info = {
	name: 'remove',
	guildOnly: true,
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
