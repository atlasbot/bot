const Permission = require('eris/lib/structures/Permission');
const { Permissions } = require('eris/lib/Constants');

const Command = require('../../../structures/Command.js');
const Parser = require('../../../tagengine');

const { constants: { VIEW_PERMS, HIDE_PERMS } } = require('./');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'ticket.create');

		if (msg.guild.channels.size >= 500) {
			return responder
				.error('Sorry, this server has hit the limit for channels (500). Ask an admin to close other tickets or delete channels to make room.')
				.send();
		}

		const existing = await this.Atlas.DB.Ticket.count({
			guild: msg.guild.id,
			author: msg.author.id,
			channel: {
				$in: msg.guild.channels.filter(c => c.type === 0).map(c => c.id),
			},
		});

		if (existing >= 3) {
			return responder.error('Sorry, you can only have three tickets open at once.').send();
		}

		const { options } = settings.plugin('tickets');
		const category = await settings.getTicketCategory();

		// discord will clean up the name for us anyway
		const name = `${msg.author.username}-${msg.author.discriminator}`;

		const channel = await msg.guild.createChannel(name, 0, `Ticket by ${msg.author.username}`, category.id);

		const ticket = await this.Atlas.DB.createTicket({
			guild: msg.guild.id,
			author: msg.author.id,
			channel: channel.id,
			reason: args.join(' '),
		});

		// make sure we can view the channel ourselves
		await channel.editPermission(msg.guild.me.id, VIEW_PERMS, 0, 'member');
		// let the user view the ticket
		await channel.editPermission(msg.author.id, VIEW_PERMS, 0, 'member');
		// stop everyone else from viewing the ticket
		await channel.editPermission(msg.guild.id, 0, HIDE_PERMS, 'role');

		if (options.support) {
			await channel.editPermission(options.support, VIEW_PERMS, 0, 'role');
		}

		await channel.edit({
			topic: `Opened by ${msg.author.username} - All messages sent to this channel are being recorded.`,
		});

		if (options.message) {
			// i don't know why, but directly after the channel is created, eris
			// thinks we don't have read messages perms when we definitely do.
			// it's not updating fast enough
			const oldPerms = channel.permissionsOf;
			channel.permissionsOf = function permissionsOf(id) {
				if (id === msg.guild.me.id) {
					return new Permission(Permissions.all);
				}

				return oldPerms.call(this, id);
			};

			const parser = new Parser({
				msg,
				settings,
				ticket,
				channel,
			});

			const { output } = await parser.parse(options.message);

			if (output) {
				await responder.channel(channel).text(output).send();
			}
		}

		return responder.text(`Your ticket has been created - ${channel.mention}.`).send();
	}
};

module.exports.info = {
	name: 'create',
	guildOnly: true,
	examples: [
		'Hi, I\'m having trouble with my chicken nuggets. pls assist thank u',
	],
	permissions: {
		bot: {
			manageChannels: true,
		},
	},
};
