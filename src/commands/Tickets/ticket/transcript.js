const Command = require('../../../structures/Command.js');

const MAX_FETCH = 500;

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'ticket.transcript');

		const ticket = await this.Atlas.DB.getTicket(msg.guild, msg.channel.id);

		if (!ticket) {
			return responder.error('commands.ticket.base.notATicket').send();
		}

		const options = settings.plugin('tickets');
		const authorPerms = msg.channel.permissionsOf(msg.author.id);
		if (ticket.author !== msg.author.id && !authorPerms.has('manageGuild') && !(msg.member.roles || []).includes(options.support)) {
			return responder.error('commands.ticket.base.noPerms').send();
		}

		const toEdit = await responder.text('generating').send();
		responder.edit(toEdit);

		const raw = await ticket.channel.getMessages(MAX_FETCH);
		const messages = raw.filter(m => m.type === 0);

		const isPublic = this.Atlas.lib.utils.toggleType(args[0], false, true);

		const { _id: id } = await this.Atlas.DB.Transcript.create({
			public: isPublic,
			guild: msg.guild.id,
			cut: raw.length === MAX_FETCH,
			messages: messages.map(m => ({
				content: m.content,
				embeds: m.embeds,
				author: m.author.id,
				timestamp: m.timestamp,
				color: m.member.highestRole && m.member.highestRole.color,
				bot: m.author.bot,
				edited: m.editedTimestamp,
			})),
		});

		return responder.text('created', id).send();
	}
};

module.exports.info = {
	name: 'transcript',
	guildOnly: true,
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
