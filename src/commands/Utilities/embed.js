const Command = require('../../structures/Command.js');

module.exports = class Embed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('embed.noArgs').send();
		}

		return responder.localised().embed({
			description: args.join(' '),
			timestamp: new Date(),
			footer: {
				// if the user doesn't have admin perms, then add their tag to the footer to prevent abuse
				text: !(msg.member && msg.member.permission.has('manageMessages')) ? msg.author.tag : null,
			},
		}).send();
	}
};

module.exports.info = {
	name: 'embed',
	examples: [
		'wew',
		'hey this looks pretty neato',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			embedLinks: true,
		},
	},
};
