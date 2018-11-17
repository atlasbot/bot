const Command = require('../../../structures/Command.js');

module.exports = class Feed extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);

		this.kraken = new this.Atlas.lib.kraken.API(process.env.KRAKEN_TOKEN, {
			host: process.env.KRAKEN_HOST,
			port: process.env.KRAKEN_PORT,
		});
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg, null, 'feed');

		let feeds = await this.kraken.getGuildFeeds(msg.guild.id);

		if (!feeds.length) {
			return responder.error('list.none', msg.prefix).send();
		}

		feeds = feeds.filter(feed => msg.guild.channels.has(feed.channel));

		return responder.embed({
			fields: [{
				name: 'list.fields.channel',
				value: feeds.map(f => msg.guild.channels.get(f.channel).mention).join('\n'),
				inline: true,
			}, {
				name: 'list.fields.type',
				value: feeds.map(f => f.feed.type).join('\n'),
				inline: true,
			}, {
				name: 'list.fields.target',
				// max target length of 5 to prevent the row not displaying correctly.
				value: feeds.map((f) => {
					if (f.feed.target.length <= 10) {
						return f.feed.target;
					}

					return `${f.feed.target.substring(0, 9)}...`;
				}).join('\n'),
				inline: true,
			}],
			timestamp: new Date(),
			footer: {
				text: ['list.footer', feeds.length],
			},
		}).send();
	}
};

module.exports.info = {
	name: 'list',
	guildOnly: true,
	aliases: [
		'showall',
		'show',
		'info',
	],
	permissions: {
		user: {
			manageGuild: true,
		},
	},
};
