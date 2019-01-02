const Command = require('../../../structures/Command.js');
const EmojiCollector = require('../../../structures/EmojiCollector');
const lib = require('./../../../../lib');

const PER_PAGE = 4;

const emojis = [
	lib.emoji.get('one'),
	lib.emoji.get('two'),
	lib.emoji.get('three'),
	lib.emoji.get('four'),
];

// fixme: doesn't handle if custom reactions are added to the embed

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args.length) {
			return responder.error('general.noUserFound').send();
		}

		const user = args.shift();
		const query = args.join(' ');
		const target = await this.Atlas.util.findMember(msg.guild, user);

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		if (args.length) {
			// remove the warning without doing shitty embed stuff

			const warn = await this.Atlas.DB.Infraction.findOne({
				reason: new RegExp(`^${this.Atlas.lib.utils.escapeRegex(query)}$`, 'i'),
			});

			if (!warn) {
				return responder.error('warn.remove.notFound').send();
			}

			await settings.removeInfraction(warn._id);

			return responder.text('warn.remove.successNoMention', warn.reason, target.tag).send();
		}

		let warnings = await settings.getInfractions(target);
		if (warnings.length === 0) {
			return responder.text('warn.remove.noWarns', target.mention).send();
		}

		const pageN = this.Atlas.lib.utils.parseNumber(args[1], 1);

		let currPageWarns;

		const pageMsg = await responder.paginate({
			user: msg.author.id,
			page: pageN,
			startAndEndSkip: false,
		}, async (paginator) => {
			const page = lib.utils.paginateArray(warnings, paginator.page.current, PER_PAGE);
			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			currPageWarns = page.data;

			if (!page.data.length) {
				return;
			}

			const embed = {
				author: {
					name: `${target.username}'s Warnings`,
					icon_url: target.avatarURL,
				},
				description: `React with a number corresponding to a warning number to remove it from ${target.tag}.`,
				fields: page.data.map((w, i) => {
					const moderator = msg.guild.members.get(w.moderator);
					const name = `${i + 1} • ${moderator ? `${moderator.tag} (${w.moderator})` : w.moderator}`;
					const value = `${w.reason} • ${new Date(w.createdAt).toLocaleDateString()}`;

					return {
						name,
						value,
					};
				}),
				timestamp: new Date(),
				footer: {
					text: paginator.showPages
						? `Page ${paginator.page.current}/${paginator.page.total} • ${warnings.length} total warns`
						: `${warnings.length} total warns`,
				},
			};

			return embed;
		}).send();

		const collector = new EmojiCollector();

		const { emojiNumbers } = this.Atlas.constants;
		const toAdd = (warnings.length <= PER_PAGE ? emojis.slice(0, warnings.length) : emojis).map(e => e.char);

		await collector
			.msg(pageMsg)
			.user(msg.author.id)
			.remove(true)
			.emoji(toAdd)
			.validate((m, emoji) => emoji.name && toAdd.includes(emoji.name))
			.exec(async (m, emoji, userID, info) => {
				const num = emojiNumbers.findIndex(e => e === info.name);

				if (isNaN(num) && currPageWarns) {
					const warn = currPageWarns[num - 1];
					if (warn) {
						await settings.removeInfraction(warn._id);

						warnings = await settings.getInfractions(target);

						if (!warnings.length) {
							pageMsg.delete().catch(() => false);

							collector.destroy();

							if (responder.collector) {
								responder.collector.destroy();
							}

							return responder.text('warn.remove.removedAll', msg.author.mention, target.tag).send();
						}

						await responder.updatePage();

						if (toAdd.length > warnings.length) {
							const toRemove = toAdd.pop();
							pageMsg.removeReaction(toRemove).catch(console.warn);
						}

						return responder.ttl(5).text('warn.remove.success', msg.author.mention, warn.reason, target.tag).send();
					}
				}
			})
			.listen();
	}
};

module.exports.info = {
	name: 'remove',
	examples: [
		'@random',
		'@sylver',
		'@sylver warning reason',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			manageMessages: true,
			addReactions: true,
		},
	},
	cooldown: {
		min: 5000,
		default: 5000,
	},
	guildOnly: true,
};
