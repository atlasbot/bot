const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Ship extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.cache = new Map();
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const user1 = await this.Atlas.util.findMember(msg.guild, args[0]);
		const user2 = await this.Atlas.util.findMember(msg.guild, args[1]) || msg.member;

		if (!user1) {
			return responder.error('You have to mention atleast one user to ship!').send();
		}

		if (this.cache.has(user1.id + user2.id)) {
			return responder.embed(this.cache.get(user1.id + user2.id)).send();
		}

		const res = await superagent.get('https://nekobot.xyz/api/imagegen')
			.query({
				type: 'ship',
				user1: user1.avatarURL || user1.defaultAvatarURL,
				user2: user2.avatarURL || user2.defaultAvatarURL,
			});
		const embed = {
			title: `${user1.tag} x ${user2.tag}`,
			image: {
				url: res.body.message,
			},
			footer: {
				text: 'Powered by the nekobot.xyz API',
			},
		};
		responder.embed(embed).send();
		this.cache.set(user1.id + user2.id, embed);
		setTimeout(() => {
			this.cache.delete(user1.id + user2.id);
		}, 30 * 60 * 1000);
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
};
