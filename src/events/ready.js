
const superagent = require('superagent');

const Player = require('../structures/Player');
const PlayerManager = require('../structures/PlayerManager');

const start = Date.now();

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute() {
		console.log(`Logged in as ${this.Atlas.client.user.tag} in ${Date.now() - start}ms`);

		// set the bot status
		if (process.env.STATUS) {
			this.Atlas.client.editStatus('online', {
				name: process.env.STATUS.split('{version}').join(this.version),
				type: 0,
			});
		}

		// start the interval interval loop
		this.Atlas.actionsInterval.start();

		// get agenda to connect and start
		this.Atlas.agenda.connect();

		try {
			// setup the player
			this.Atlas.client.voiceConnections = new PlayerManager(this.Atlas.client, JSON.parse(process.env.LAVALINK_NODES), {
				numShards: this.Atlas.client.options.maxShards,
				userId: this.Atlas.client.user.id,
				defaultRegion: 'us',
				player: Player,
			});
			// usually throws when no nodes were listed
		} catch (e) {} // eslint-disable-line no-empty

		// if (process.env.AUTOSCALE !== 'true') {
		// 	return;
		// }

		// restarts the shard when thte total shard count has changed
		// this may not be such a great idea with 20+ shards
		// setInterval(async () => {
		// 	const { body: { shards, session_start_limit: startLimit } } = await superagent.get('https://discordapp.com/api/gateway/bot')
		// 		.set('Authorization', `Bot ${process.env.TOKEN}`);

		// 	if (startLimit.remaining >= 1 && this.Atlas.client.options.maxShards !== shards) {
		// 		console.warn('Shard configuration changed, restarting...');

		// 		process.exit(0);
		// 	}
		// }, 12000);
	}
};
