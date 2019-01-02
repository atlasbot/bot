const Command = require('../../structures/Command.js');

module.exports = class Embed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		parsedArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (parsedArgs.d) {
			msg.delete().catch(() => false);
		}

		if (!args.length) {
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
	supportedFlags: [{
		name: 'd',
		desc: 'Deletes the invocation message.',
	}],
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			embedLinks: true,
		},
	},
};
