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
			return responder.error(`Please include a new suffix. Do \`${msg.displayPrefix}ticket suffix off\` to remove the prefix.`).send();
		}

		const author = await settings.findUser(ticket.author);

		if (!author) {
			return responder.error('The author of this ticket is no where to be found. The ticket suffix cannot be changed.').send();
		}

		const type = this.Atlas.lib.utils.toggleType(args[0], false);

		let name = `${author.username}-${author.discriminator}`;

		if (type === false) {
			await msg.channel.edit({
				name,
			});

			return responder.text('The suffix for this ticket has been removed.').send();
		}

		const suffix = args.join(' ');

		name += `-${suffix}`;

		await msg.channel.edit({ name });

		return responder.text(`The ticket's suffix is now \`${suffix}\``).send();
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
