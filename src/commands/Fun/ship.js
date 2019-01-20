const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		const user1 = await this.Atlas.util.findUser(msg.guild, args[0]);
		const user2 = await this.Atlas.util.findUser(msg.guild, args[1]) || msg.member;

		if (!user1) {
			return responder.error('You have to mention atleast one user to ship!').send();
		}

		const res = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'ship',
				user1: user1.avatarURL,
				user2: user2.avatarURL,
			})
			.set('User-Agent', this.Atlas.userAgent);

		const embed = {
			title: `${user1.tag} x ${user2.tag}`,
			image: {
				url: res.body.message,
			},
			footer: {
				text: 'general.poweredBy.nekobot',
			},
		};

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'ship',
	aliases: [
		'shipit',
	],
	examples: [
		'@Random @Random',
		'@Random',
	],
	guildOnly: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
