
const Player = require('../structures/Player');
const PlayerManager = require('../structures/PlayerManager');

const start = Date.now();

module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute() {
		console.log(`Logged in as ${this.Atlas.client.user.tag} in ${Date.now() - start}ms`);

		// setup the player
		this.Atlas.client.voiceConnections = new PlayerManager(this.client, JSON.parse(process.env.LAVALINK_NODES), {
			numShards: this.client.options.maxShards,
			userId: this.client.user.id,
			defaultRegion: 'us',
			player: Player,
		});

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
	}
};
