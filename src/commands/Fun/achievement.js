const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Achievement extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		cleanArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('achievement.noArgs').send();
		}

		const item = Math.floor((Math.random() * 39) + 1);
		const header = responder.format('achievement.header');

		// downloading because links look ugly & embeds look worse
		const { body } = await superagent.get(`https://www.minecraftskinstealer.com/achievement/a.php?t=${cleanArgs.join('+')}`)
			.query({
				i: item,
				h: header,
			})
			.set('User-Agent', this.Atlas.userAgent);

		return responder.file({
			file: body,
			name: `${new Date().getTime()}.png`,
		}).send();
	}
};

module.exports.info = {
	name: 'achievement',
	permissions: {
		bot: {
			attachFiles: true,
		},
	},
};
