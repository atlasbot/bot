const MessageCollector = require('../../structures/MessageCollector');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'togglementionable');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		let query;
		if (args.length >= 2 && args[args.length - 1] === 'true') {
			query = args.slice(0, args.length - 1).join(' ');
		} else {
			query = args.join(' ');
		}

		const role = await settings.findRoleOrChannel(query, {
			type: 'role',
		});

		if (!role) {
			return responder.error('noRole', query).send();
		}

		if (!msg.guild.me.highestRole.higherThan(role)) {
			return responder.error('perms.bot').send();
		}

		if (!msg.member.highestRole.higherThan(role)) {
			return responder.error('perms.user').send();
		}

		const autoToggle = this.Atlas.lib.utils.toggleType(args[args.length - 1]);

		const state = autoToggle ? true : !role.mentionable;

		if (role.mentionable !== state) {
			await role.edit({
				mentionable: state,
			}, `Mention toggle by ${msg.author.tag}`);
		}

		if (autoToggle) {
			const filter = sent => sent.author.id === msg.author.id && sent.roleMentions.includes(role.id);
			const collector = new MessageCollector(null, filter);

			collector.listen();

			collector.on('message', async () => {
				collector.end();

				if (role.mentionable === true) {
					await role.edit({
						mentionable: false,
					}, `Mention auto-off by ${msg.author.tag}`);
				}

				return responder
					.dm(msg.author)
					.text('dm', role.name)
					.send();
			});
		}

		if (state === true) {
			responder.text('mentionable', role.name);

			if (autoToggle) {
				responder.text('autoToggle');
			}

			return responder.send();
		}

		return responder.text('unmentionable', role.name).send();
	}
};

module.exports.info = {
	name: 'togglementionable',
	aliases: [
		'togglemention',
		'tment',
	],
	examples: [
		'@role true',
		'role',
		'@role',
	],
	permissions: {
		user: {
			manageRoles: true,
		},
		bot: {
			manageRoles: true,
		},
	},
	guildOnly: true,
};
