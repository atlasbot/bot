const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'ticket.suffix');

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
			return responder.error('noSuffix', msg.displayPrefix).send();
		}

		const author = await settings.findUser(ticket.author);

		if (!author) {
			return responder.error('noAuthor').send();
		}

		const type = this.Atlas.lib.utils.toggleType(args[0], false);

		let name = `${author.username}-${author.discriminator}`;

		if (type === false) {
			await msg.channel.edit({
				name,
			});

			return responder.text('removed').send();
		}

		const suffix = args.join(' ');

		name += `-${suffix}`;

		await msg.channel.edit({ name });

		return responder.text('set', suffix).send();
	}
};

module.exports.info = {
	name: 'suffix',
	guildOnly: true,
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
