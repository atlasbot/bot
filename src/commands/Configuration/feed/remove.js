const Command = require('../../../structures/Command.js');

module.exports = class Feed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.kraken = new this.Atlas.lib.kraken.API(process.env.KRAKEN_TOKEN, {
			host: process.env.KRAKEN_HOST,
			port: process.env.KRAKEN_PORT,
		});
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'feed');

		const [, targetQuery] = args;

		const types = await this.kraken.getTypes();

		const formattedTypes = types.join('`, `');

		if (!args[0]) {
			return responder.error('general.noType', formattedTypes).send();
		}

		const type = args.shift().toLowerCase();

		if (!types.includes(type)) {
			return responder.error('general.invalidType', type, formattedTypes).send();
		}

		if (!targetQuery) {
			return responder.error('general.noTarget').send();
		}

		const x = await this.Atlas.lib.kraken.validateTarget(type, targetQuery);
		if (!x) {
			return responder.error('general.invalidTarget', targetQuery, type).send();
		}

		const { target, name } = x;

		try {
			await this.kraken.deleteGuildFeed(type, target, msg.guild.id);

			return responder.text('remove.success', name).send();
		} catch (e) {
			console.error(e.response.body);
			if (e.response && e.response.body.code === 40002) {
				return responder.error('remove.doesntExist').send();
			}

			throw e;
		}
	}
};

module.exports.info = {
	name: 'remove',
	guildOnly: true,
	examples: [
		'reddit r/askreddit',
		'youtube frankie',
		'twitch twitch.tv/cyanideplaysgames',
	],
	aliases: [
		'delete',
	],
	permissions: {
		user: {
			manageGuild: true,
		},
	},
};
