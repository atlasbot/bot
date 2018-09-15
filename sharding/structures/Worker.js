const Eris = require('eris');

require('./../util/logger');

module.exports = class Cluster {
	constructor() {
		this.shards = 0;
		this.firstShardID = 0;
		this.lastShardID = 0;
		this.entryPoint = null;
		this.clusterID = null;
		this.token = null;
		this.maxShards = 0;

		this.clientOptions = {};
		this.bot = null;

		this.clusters = new Map();
	}

	spawn() {
		process.on('message', (msg) => {
			if (msg.name === 'connect') {
				const { shards, firstShardID, lastShardID, entryPoint, id, clientOptions, token, maxShards } = msg;

				this.shards = shards;
				this.firstShardID = firstShardID;
				this.lastShardID = lastShardID;
				this.entryPoint = entryPoint;
				this.clusterID = id;
				this.clientOptions = clientOptions;
				this.token = token;
				this.maxShards = maxShards;

				if (this.shards <= 0) return;

				this.connect();
			}
		});
	}

	connect() {
		const options = {
			autoreconnect: true,
			firstShardID: this.firstShardID,
			lastShardID: this.lastShardID,
			maxShards: this.maxShards,
		};

		const App = require(this.entryPoint);

		this.bot = new Eris(this.token, {
			...this.clientOptions,
			...options,
		});

		this.bot.on('ready', () => {
			this.app = new App({
				bot: this.bot,
				clusterID: this.clusterID,
			});

			this.app.launch();
		});

		this.bot.connect();
	}
};
