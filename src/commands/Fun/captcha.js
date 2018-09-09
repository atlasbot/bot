const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Captcha extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.cache = new Map();
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		let user;
		if (args[0]) {
			user = await this.Atlas.util.findMember(msg.guild, args.join(' '));
			if (!user) {
				return responder.error('general.noUserFound').send();
			}
		} else {
			user = msg.member;
		}

		if (this.cache.has(user.id)) {
			return responder.embed(this.cache.get(user.id)).send();
		}

		const res = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'captcha',
				url: user.avatarURL || user.defaultAvatarURL,
				username: user.nick || user.username,
			});
		const embed = {
			image: {
				url: res.body.message,
			},
			footer: {
				text: 'Powered by the nekobot.xyz API',
			},
		};
		responder.embed(embed).send();
		this.cache.set(user.id, embed);
		setTimeout(() => {
			this.cache.delete(user.id);
		}, 30 * 60 * 1000);
	}
};

module.exports.info = {
	name: 'captcha',
	description: 'info.captcha.description',
	aliases: [
		'captchafy',
	],
	usage: 'info.captcha.usage',
	examples: [
		'@Sylver',
	],
	guildOnly: true,
};
