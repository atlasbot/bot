const superagent = require('superagent');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		let user;
		if (args[0]) {
			user = await this.Atlas.util.findUser(msg.guild, args.join(' '));
			if (!user) {
				return responder.error('general.noUserFound').send();
			}
		} else {
			user = msg.member;
		}

		const { body } = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'captcha',
				url: user.avatarURL,
				username: user.nick || user.username,
			})
			.set('User-Agent', this.Atlas.userAgent);

		return responder.embed({
			image: {
				url: body.message,
			},
			footer: {
				text: 'general.poweredBy.nekobot',
			},
		}).send();
	}
};

module.exports.info = {
	name: 'captcha',
	aliases: [
		'captchafy',
	],
	examples: [
		'@Sylver',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
