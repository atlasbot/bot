const superagent = require('superagent');
const url = require('url');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('botinfo.noArgs').send();
		}

		let target = await settings.findUser(args.join(' '));

		try {
			let bot;
			const snowflake = this.Atlas.lib.utils.isSnowflake(args.join(' ').replace(/<|@|!|>/g, ''));
			// if the target is not a bot and the query was not a mention, maybe they wanted to search and it just happened
			// to find a guild member
			if (!target || (target.bot && !snowflake)) {
				// if it was a snowflake or a mention, ignore it
				if (snowflake) {
					return responder.error('botinfo.noArgs').send();
				}
				// try and search DBL for the query
				const { body: { results } } = await superagent.get('https://discordbots.org/api/bots')
					.set('Authorization', process.env.DBL_KEY)
					.set('User-Agent', this.Atlas.userAgent)
					.query({
						search: args.join(' '),
						limit: 10,
					});

				bot = this.getBest(results);

				if (!bot) {
					return responder.error('botinfo.notFound').send();
				}

				target = await settings.findUser(bot.id);
			} else {
				({ bot } = await superagent.get(`https://discordbots.org/api/bots/${target.id}`)
					.set('Authorization', process.env.DBL_KEY)
					.set('User-Agent', this.Atlas.userAgent));
			}

			if (!target.bot) {
				return responder.error('botinfo.notABot').send();
			}

			const owners = [];
			for (let i = 0; i < bot.owners.length; i++) {
				if (i > 5) {
					owners.push(` + ${bot.owners.length - 5} more`);
					break;
				}
				const owner = bot.owners[i];
				const member = await settings.findUser(owner);
				if (member) {
					owners.push(`[${member.tag}](https://discordbots.org/user/${member.id})`);
				}
			}

			const embed = {
				thumbnail: {
					url: target.avatarURL,
				},
				url: `https://discordbots.org/bot/${bot.vanity || target.id}`,
				title: target.username,
				description: bot.shortdesc.toString(),
				fields: [{
					name: 'botinfo.embed.prefix',
					value: bot.prefix,
					inline: true,
				}, {
					name: 'botinfo.embed.library',
					value: bot.lib,
					inline: true,
				}, {
					name: 'botinfo.embed.servers.name',
					value: bot.server_count ? bot.server_count.toLocaleString() : 'botinfo.embed.servers.none',
					inline: true,
				}, {
					name: 'botinfo.embed.shards.name',
					value: bot.shard_count ? bot.shard_count.toLocaleString() : 'botinfo.embed.shards.none',
					inline: true,
				}, {
					name: 'botinfo.embed.github.name',
					value: bot.github
						? `[${url.parse(bot.github).pathname.slice(1)}](${bot.github})`
						: 'botinfo.embed.github.none',
					inline: true,
				}, {
					name: 'botinfo.embed.website.name',
					value: bot.website
						? `[${url.parse(bot.website).hostname}](${bot.website})`
						: 'botinfo.embed.website.none',
					inline: true,
				}, {
					name: 'botinfo.embed.invite',
					value: `[Click here](${bot.invite})`,
					inline: true,
				}, {
					name: 'botinfo.embed.support.name',
					value: bot.support
						? `[Click here](https://discordapp.com/invite/${bot.support})`
						: 'botinfo.embed.support.none',
					inline: true,
				}, {
					name: 'botinfo.embed.owners',
					value: owners.join(', '),
				}],
				timestamp: new Date(bot.date),
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

		return best || bots[0];
	}
};

module.exports.info = {
	name: 'botinfo',
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
	examples: [
		'@Atlas',
		'dyno',
		'Mee6',
	],
};
