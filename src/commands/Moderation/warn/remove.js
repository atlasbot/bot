const moment = require('moment');
const Command = require('../../../structures/Command.js');
const EmojiCollector = require('../../../structures/EmojiCollector');
const lib = require('./../../../../lib');

const PER_PAGE = 2;

const emojis = [
	lib.utils.emoji.fromName('one'),
	lib.utils.emoji.fromName('two'),
	// lib.utils.emoji.fromName('three'),
	// lib.utils.emoji.fromName('four'),
];

// fixme: doesn't handle if custom reactions are added to the embed

module.exports = class Remove extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Paginator(msg);

		if (!args[0]) {
			return responder.error('general.noUserFound').send();
		}

		if (!msg.guild.me.permission.json.addReactions) {
			return responder.error('warn.remove.missingPerms').send();
		}

		const user = args.shift();
		const query = args.join(' ');
		const target = await this.Atlas.util.findMember(msg.guild, user);

		if (args[1]) {
			// remove the warning without doing shitty embed stuff

			const warn = (new this.Atlas.structs.Fuzzy(settings.settings.plugins.moderation.infractions, {
				keys: ['reason'],
			})).search(query);

			if (!warn) {
				return responder.error('warn.remove.notFound').send();
			}

			await settings.removeWarning(warn._id);

			return responder.text('warn.remove.successNoMention', warn.reason, target.tag).send();
		}

		let warnings = settings.getWarnings(target);
		if (warnings.length === 0) {
			return responder.text('warn.remove.noWarns', target.mention).send();
		}

		const pageN = isNaN(args[1]) ? 1 : Number(args[1]);

		const has = [];
		let currPageWarns;

		const pageMsg = await responder.paginate({
			user: msg.author.id,
			page: pageN,
			startAndEndSkip: false,
		}, async (paginator) => {
			/*
				Pagination handler
			*/
			const page = lib.utils.paginateArray(warnings, paginator.page.current, PER_PAGE);
			// set the total page count once it's been (re)calculated
			paginator.page.total = page.totalPages;

			currPageWarns = page.data;

			if (page.data.length === 0) {
				return;
			}

			const table1 = page.data.map((w, i) => `${i + 1}. ${w.reason}`);
			const table2 = page.data.map(w => moment(w.date).calendar());
			const table3 = page.data.map((w) => {
				const member = msg.guild.members.get(w.moderator);
				if (member) {
					return member.tag;
				}

				return w.moderator;
			});

			const embed = {
				title: `${target.tag}'s Warnings`,
				description: `${target.nick || target.username} has ${warnings.length} warnings.`,
				fields: [{
					name: 'Reason',
					value: table1.join('\n'),
					inline: true,
				}, {
					name: 'Date',
					value: table2.join('\n'),
					inline: true,
				}, {
					name: 'Moderator',
					value: table3.join('\n'),
					inline: true,
				}],
				timestamp: new Date(),
				footer: {
					text: paginator.showPage ? `Page ${paginator.page.current}/${paginator.page.total}` : null,
				},
			};

			// make sure there are proper emojis to warn counts
			if (responder.embedMsg) {
				if (has.length > page.data.length) {
					const removing = has.slice(-(PER_PAGE - page.data.length));
					for (const em of removing) {
						try {
							await responder.embedMsg.removeReaction(em);
							has.pop();
						} catch (e) {
							console.error(e);
						}
					}
				}
				if (has.length < page.data.length && responder.embedMsg) {
					const adding = emojis.slice((page.data.length - has.length)).map(c => c.surrogates);
					for (const em of adding) {
						try {
							await responder.embedMsg.addReaction(em);
							has.push(em);
						} catch (e) {
							console.error(e);
						}
					}
				}
			}

			return embed;
		}).send();

		const collector = new EmojiCollector();

		const { emojiNumbers } = this.Atlas.constants;
		const toAdd = (warnings.length <= PER_PAGE ? emojis.slice(0, warnings.length) : emojis).map(e => e.surrogates);

		has.push(...toAdd);

		await collector
			.msg(pageMsg)
			.user(msg.author.id)
			.remove(true)
			.emoji(toAdd)
			.validate((m, emoji) => emoji.name && toAdd.includes(emoji.name))
			.exec(async (m, emoji, userID, info) => {
				const num = emojiNumbers.findIndex(e => e === info.name);
				if (!isNaN(num) && currPageWarns) {
					const warn = currPageWarns[num - 1];
					if (warn) {
						await settings.removeWarning(warn._id);

						warnings = settings.getWarnings(target);

						if (warnings.length === 0) {
							pageMsg.delete().catch(() => false);
							collector.destroy();
							if (responder.collector) {
								responder.collector.destroy();
							}

							return responder.text('warn.remove.removedAll', msg.author.mention, target.tag).send();
						}

						await responder.updatePage();

						return responder.text('warn.remove.success', msg.author.tag, warn.reason, target.tag);
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
		},
	},
	cooldown: {
		min: 5000,
		default: 5000,
	},
	guildOnly: true,
};
