const Command = require('../../structures/Command.js');

module.exports = class Advice extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
		cleanArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('achievement.noArgs').send();
		}

		const item = Math.floor((Math.random() * 39) + 1);

		const header = responder.format('achievement.header');

		return responder.embed({
			image: {
				url: encodeURI(`https://www.minecraftskinstealer.com/achievement/a.php?t=${cleanArgs.join('+')}&i=${item}&h=${header}`),
			},
			// 3553599 is the same color as discord's (on pc) background, which makes the embed harder to see
			color: 3553599,
		}).send();
	}
};

module.exports.info = {
	name: 'achievement',
	description: 'info.achievement.description',
};
