const Command = require('../../../structures/Command.js');

const { constants: { VIEW_PERMS } } = require('./');

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
			return responder.error('Please include a user to add.').send();
		}

		const member = await settings.findUser(args.join(' '), {
			memberOnly: true,
		});

		if (!member) {
			return responder.error('I could not find a member in this guild matching your query').send();
		}

		const perms = msg.channel.permissionsOf(member.id);
		if (perms.has('sendMessages')) {
			return responder.error(`${member.username} can already view this ticket.`).send();
		}

		await msg.channel.editPermission(member.id, VIEW_PERMS, 0, 'member');

		return responder.text(`${member.mention} can now view this ticket.`).send();
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
