const Command = require('../../../structures/Command.js');

module.exports = class List extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const { services } = settings.plugin('feeds');
		if (!services[0]) {
			return responder.error('feeds.list.noServices').send();
		}

		const chunked = {};
		for (const i of services) {
			if (chunked[i.type]) {
				chunked[i.type].push(i);
			} else {
				chunked[i.type] = [i];
			}
		}

		return responder.embed({
			fields: Object.keys(chunked).map((k) => {
				let prefix = '';

				if (k === 'reddit') {
					prefix = 'r/';
				}

				return {
					name: k,
					value: chunked[k]
						.filter(c => msg.guild.channels.has(c.channel))
						.map(c => `**•** ${msg.guild.channels.get(c.channel).mention} - ${prefix}${c.target}`).join('\n'),
				};
			}),
			timestamp: new Date(),
		}).send();
	}
};

module.exports.info = {
	name: 'list',
	guildOnly: true,
	permissions: {
		user: {
			manageGuild: true,
		},
		bot: {
			embedLinks: true,
			manageWebhooks: true,
		},
	},
};
