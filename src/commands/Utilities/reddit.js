const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class Reddit extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args.length) {
			return responder.error('reddit.noArgs').send();
		}

		const subname = this.Atlas.lib.utils.cleanSubreddit(args[0]);

		try {
			const subReq = await superagent.get(`https://www.reddit.com/r/${subname}/about.json`)
				.query({
					raw_json: 1,
				})
				.set('User-Agent', this.Atlas.userAgent);

			const postReq = await superagent.get(`https://www.reddit.com/r/${subname}.json`)
				.query({
					raw_json: 1,
					limit: 4,
				})
				.set('User-Agent', this.Atlas.userAgent);

			const subInfo = subReq.body.data;
			let posts = postReq.body.data.children.map(c => c.data);

			if (!msg.channel.nsfw) {
				if (subInfo.over18) {
					return responder.error('reddit.over18').send();
				}

				posts = posts.filter(p => !p.over18);
			}

			return responder.paginate({
				user: msg.author.id,
				total: 2,
				startAndEndSkip: false,
			}, (paginator) => {
				if (paginator.page.current === 1) {
				// we're displaying the subreddit info
					let color;
					if (subInfo.primary_color) {
						color = parseInt(subInfo.primary_color.split('#').join(''), 16);
					}

					return {
						title: subInfo.display_name_prefixed,
						url: `https://reddit.com${subInfo.url}`,
						thumbnail: {
							url: subInfo.icon_img,
						},
						description: paginator.page.current === 1 ? subInfo.public_description : null,
						footer: {
							text: '1/2',
						},
						timestamp: new Date(),
						fields: [],
						color,
					};
				}
				// we're displaying a list of posts

				return {
					title: `Trending in ${subInfo.display_name_prefixed}`,
					url: `https://reddit.com${subInfo.url}`,
					description: `\n${posts.map(p => `• [${p.title.substring(0, 256)}](https://reddit.com${p.permalink})`).join('\n')}`,
					footer: {
						text: '2/2',
					},
					timestamp: new Date(),
				};
			}).send();
		} catch (e) {
			if (e.status && [301, 302, 307, 404].includes(e.status)) {
				return responder.error('reddit.invalid', subname).send();
			}

			throw e;
		}
	}
};

module.exports.info = {
	name: 'reddit',
	examples: [
		'r/AskReddit',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
