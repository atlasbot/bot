const superagent = require('superagent');
const Command = require('../../structures/Command.js');

// there's some weird shit on there man
const FILTERED_TAGS = [
	'rape',
	'sex',
	'gross',
];

module.exports = class WouldYouRather extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { sentence } = await this.get(msg.channel.nsfw);

		const reactionMsg = await responder.localised().text(`Would you rather - ${sentence}`).send();

		if (msg.channel.permissionsOf(this.Atlas.client.user.id).has('addReactions')) {
			try {
				await reactionMsg.addReaction(this.Atlas.lib.emoji.get('one').char);
				await reactionMsg.addReaction(this.Atlas.lib.emoji.get('two').char);
			} catch (e) {
				console.error(e);
			}
		}
	}

	async get(nsfw = false, loop = 0) {
		if (loop > 5) {
			throw new Error('nope');
		}

		const { body } = await superagent.get('http://www.rrrather.com/botapi');

		let isNsfw = body.nsfw;
		let tags = [];
		if (body.tags) {
			tags = body.tags.split(',');
		}
		if (FILTERED_TAGS.some(t => tags.includes(t))) {
			isNsfw = true;
		}

		if (isNsfw && !nsfw) {
			return this.get(nsfw, loop++);
		}

		const sentence = `${this.clean(body.choicea)} **or** ${this.clean(body.choiceb)}?`;

		return {
			...body,
			nsfw,
			tags,
			sentence,
		};
	}

	clean(str, lower = true) {
		const clean = str.replace(/(\?|!|\.)/g, '');

		return lower ? clean.charAt(0).toLowerCase() + clean.slice(1) : clean;
	}
};

module.exports.info = {
	name: 'wouldyourather',
	aliases: [
		'wyr',
	],
};
