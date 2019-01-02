const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'nodes');

		const { nodes } = this.Atlas.client.voiceConnections;

		if (!nodes.size) {
			return responder.error('noNodes').send();
		}

		return responder.embed({
			fields: [{
				name: 'node',
				value: Array.from(nodes.values()).map((node, index) => `${node.region}-${index + 1}`).join('\n'),
				inline: true,
			}, {
				name: 'players',
				value: nodes.map(n => n.stats.players.toLocaleString()).join('\n'),
				inline: true,
			}, {
				name: 'events',
				value: nodes.map(n => n._eventsCount.toLocaleString()).join('\n'),
				inline: true,
			}],
			footer: {
				text: 'footer',
			},
			timestamp: new Date(),
		}).send();
	}
};

module.exports.info = {
	name: 'nodes',
	guildOnly: true,
};
