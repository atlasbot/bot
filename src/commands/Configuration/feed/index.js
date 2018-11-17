const Command = require('../../../structures/Command.js');


module.exports = class Feed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'feed.base');

		return responder.text('noArgs').send();
	}
};

module.exports.info = {
	name: 'feed',
	guildOnly: true,
	aliases: [
		'feeds',
	],
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			manageWebhooks: true,
		},
	},
};
