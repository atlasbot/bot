const Command = require('../../../structures/Command.js');


module.exports = class Moderation extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0] || this.Atlas.lib.utils.toggleType(args.join(' '), false) === false) {
			await settings.update({
				'plugins.moderation.logs.mod': null,
			});

			return responder.text('log.moderation.disabled').send();
		}

		const query = args.join(' ');

		const channel = (new this.Atlas.structs.Fuzzy(msg.guild.channels, {
			keys: ['name', 'id', 'mention'],
		})).search(query);

		if (!channel) {
			return responder.error('log.noResults', query).send();
		}

		await settings.update({
			'plugins.moderation.logs.mod': channel.id,
		});

		return responder.text('log.moderation.success', channel.mention).send();
	}
};

module.exports.info = {
	name: 'moderation',
	guildOnly: true,
	aliases: ['mod', 'mods', 'moderations'],
	requirements: {
		permissions: {
			user: {
				manageGuild: true,
			},
			bot: {
				manageWebhooks: true,
			},
		},
	},
};
