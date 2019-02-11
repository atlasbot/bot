const Command = require('../../../structures/Command.js');

const { constants: { VIEW_PERMS } } = require('./');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'ticket.add');

		const ticket = await this.Atlas.DB.getTicket(msg.guild, msg.channel.id);

		if (!ticket) {
			return responder.error('commands.ticket.base.notATicket').send();
		}

		const options = settings.plugin('tickets');
		const authorPerms = msg.channel.permissionsOf(msg.author.id);
		if (ticket.author !== msg.author.id && !authorPerms.has('manageGuild') && !(msg.member.roles || []).includes(options.support)) {
			return responder.error('commands.ticket.base.noPerms').send();
		}

		if (!args.length) {
			return responder.error('noUser').send();
		}

		const member = await settings.findUser(args.join(' '), {
			memberOnly: true,
		});

		if (!member) {
			return responder.error('commands.ticket.base.userNotFound', args.join(' ')).send();
		}

		const perms = msg.channel.permissionsOf(member.id);
		if (perms.has('sendMessages')) {
			return responder.error('alreadyAdded', member.username).send();
		}

		await msg.channel.editPermission(member.id, VIEW_PERMS, 0, 'member');

		return responder.text('added', member.mention).send();
	}
};

module.exports.info = {
	name: 'add',
	guildOnly: true,
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
