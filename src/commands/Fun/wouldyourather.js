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

		this.prefetcher = new this.Atlas.lib.structs.Prefetcher({
			url: 'http://www.rrrather.com/botapi',
		});
		this.prefetcher.init();
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { sentence } = await this.get(msg.channel.nsfw);

		const reactionMsg = await responder.localised(true).text(`Would you rather - ${sentence}`).send();

		if ((msg.guild && msg.guild.me.permission.json.addReactions)) {
			try {
				await reactionMsg.addReaction(this.Atlas.lib.utils.emoji.fromName('one').surrogates);
				await reactionMsg.addReaction(this.Atlas.lib.utils.emoji.fromName('two').surrogates);
			} catch (e) {
				console.error(e);
			}
		}
	}

	async get(nsfw = false, loop = 0) {
		if (loop > 5) {
			throw new Error('nope');
		}

		const { body } = await this.prefetcher.get();

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
	description: 'info.wouldyourather.description',
	aliases: [
		'wyr',
	],
};
