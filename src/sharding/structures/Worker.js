const Eris = require('eris');
const Logger = require('atlas-lib/lib/Logger');

const logger = new Logger(true); // eslint-disable-line no-unused-vars

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
		this.client = null;

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
		const start = new Date();

		const App = require(this.entryPoint);

		this.client = new Eris(this.token, {
			...this.clientOptions,
			autoreconnect: true,
			firstShardID: this.firstShardID,
			lastShardID: this.lastShardID,
			maxShards: this.maxShards,
		});

		this.client.on('hello', (trace, id) => {
			console.log(`gateway(s) ${trace.join(' ')}, id ${id}`);
		});

		this.client.on('ready', async () => {
			const end = new Date();

			console.info(`Logged in as ${this.client.user.tag} in ${end - start}ms`);

			this.app = new App({
				client: this.client,
				clusterID: this.clusterID,
			});

			await this.app.launch();
		});

		this.client.connect();
	}
};
