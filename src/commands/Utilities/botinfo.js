const superagent = require('superagent');
const url = require('url');

const Command = require('../../structures/Command.js');

module.exports = class BotInfo extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('botinfo.noArgs').send();
		}

		let target = await settings.findMember(args.join(' '));

		try {
			let body;
			const snowflake = this.Atlas.lib.utils.isSnowflake(args.join(' ').replace(/<|@|!|>/g, ''));
			// if the target is not a bot and the query was not a mention, maybe they wanted to search and it just happened
			// to find a guild member
			if (!target || (target.bot && !snowflake)) {
				// if it was a snowflake or a mention, ignore it
				if (snowflake) {
					return responder.error('botinfo.noArgs').send();
				}
				// try and search DBL for the query
				const res = await superagent.get('https://discordbots.org/api/bots')
					.set('Authorization', process.env.DISCORDBOTS_ORG_TOKEN)
					.query({
						search: args.join(' '),
						limit: 10,
					});

				body = this.getBest(res.body.results);

				target = await settings.findMember(body.id);
			} else {
				({ body } = await superagent.get(`https://discordbots.org/api/bots/${target.id}`)
					.set('Authorization', process.env.DISCORDBOTS_ORG_TOKEN));
			}

			if (!target.bot) {
				return responder.error('botinfo.notABot').send();
			}

			const owners = [];
			for (let i = 0; i < body.owners.length; i++) {
				if (i > 5) {
					owners.push(` + ${body.owners.length - 5} more`);
					break;
				}
				const owner = body.owners[i];
				const member = await settings.findMember(owner);
				if (member) {
					owners.push(`[${member.tag}](https://discordbots.org/user/${member.id})`);
				}
			}

			const embed = {
				thumbnail: {
					url: target.avatarURL || target.defaultAvatarURL,
				},
				url: `https://discordbots.org/bot/${body.vanity || target.id}`,
				title: target.username,
				description: body.shortdesc.toString(),
				fields: [{
					name: 'botinfo.embed.prefix',
					value: body.prefix,
					inline: true,
				}, {
					name: 'botinfo.embed.library',
					value: body.lib,
					inline: true,
				}, {
					name: 'botinfo.embed.servers.name',
					value: body.server_count ? body.server_count.toLocaleString() : 'botinfo.embed.servers.none',
					inline: true,
				}, {
					name: 'botinfo.embed.shards.name',
					value: body.shard_count ? body.shard_count.toLocaleString() : 'botinfo.embed.shards.none',
					inline: true,
				}, {
					name: 'botinfo.embed.github.name',
					value: body.github
						? `[${url.parse(body.github).pathname.slice(1)}](${body.github})`
						: 'botinfo.embed.github.none',
					inline: true,
				}, {
					name: 'botinfo.embed.website.name',
					value: body.website
						? `[${url.parse(body.website).hostname}](${body.website})`
						: 'botinfo.embed.website.none',
					inline: true,
				}, {
					name: 'botinfo.embed.owners',
					value: owners.join(', '),
				}],
				timestamp: new Date(body.date),
				footer: {
					text: 'botinfo.embed.footer',
				},
			};

			return responder.embed(embed).send();
		} catch (e) {
			if (e.status === 404) {
				return responder.error('botinfo.notFound').send();
			}

			throw e;
		}
	}

	getBest(bots) {
		let best = bots[0];

		for (let i = 0; i < bots.length; i++) {
			const bot = bots[i];
			if (best.servers && bot.servers && bot.servers > best.servers) {
				best = bot;
			} else if (bot.points > best.points) {
				// this could use monthly total points but that's no fun
				best = bot;
			}
		}

		return best;
	}
};

module.exports.info = {
	name: 'botinfo',
	usage: 'info.botinfo.usage',
	description: 'info.botinfo.description',
	requirements: {
		permissions: {
			bot: {
				embedLinks: true,
			},
		},
	},
	examples: [
		'@Atlas',
		'dyno',
		'Mee6',
	],
};
