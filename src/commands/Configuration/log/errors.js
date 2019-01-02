const Command = require('../../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0] || this.Atlas.lib.utils.toggleType(args.join(' '), false) === false) {
			await settings.update({
				'plugins.moderation.logs.error': null,
			});

			return responder.text('log.errors.disabled').send();
		}

		const query = args.join(' ');

		const channel = (new this.Atlas.lib.structs.Fuzzy(msg.guild.channels, {
			keys: ['name', 'id', 'mention'],
		})).search(query);

		if (!channel) {
			return responder.error('log.noResults', query).send();
		}

		await settings.update({
			'plugins.moderation.logs.error': channel.id,
		});

		return responder.text('log.errors.success', channel.mention).send();
	}
};

module.exports.info = {
	name: 'errors',
	guildOnly: true,
	aliases: ['error'],
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			manageWebhooks: true,
		},
	},
};
