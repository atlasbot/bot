const superagent = require('superagent');
const cluster = require('cluster');
const Worker = require('./Worker');
const { version } = require('./../../package.json');

require('./../util/logger');

module.exports = class Manager {
	constructor(token, entryPoint, {
		guildsPerShard = 1000,
		clientOptions,
	}) {
		this.token = `Bot ${token}`;
		this.entryPoint = entryPoint;
		this.options = {
			guildsPerShard,
			clientOptions,
		};

		this.shards = {
			current: 0,
			max: 0,
		};

		this.firstShardID = 0;

		this.clusterCount = require('os').cpus().length;
		this.userAgent = `Atlas Sharder (https://github.com/get-atlas/bot, ${version})`;

		this.launch();
		this.clusters = new Map();
	}

	async launch() {
		if (cluster.isMaster) {
			const { shards, session_start_limit } = await this.getBotGateway(); // eslint-disable-line camelcase
			if (session_start_limit.remaining < 50) {
				console.warn(`Approaching session start limit - remaining: ${session_start_limit.remaining}, resets in ${session_start_limit.reset_after}ms`);
			}

			this.shards.max = shards;

			if (this.shards.max < this.clusterCount) {
				console.warn('Limiting cluster count to shard count instead of CPU count as there are less shards then CPUs.');
				this.clusterCount = this.shards.max;
			}

			this.start(this.clusterCount);

			cluster.on('exit', (worker) => {
				console.warn(`Cluster ${worker.id} died, starting new cluster in it's place...`);
				const options = this.clusters.get(worker.id);

				return this.start(1, 0, options, true);
			});
		} else {
			// start a new cluster
			const worker = new Worker();
			worker.spawn();
		}
	}

	start(amount, spawned = 0, options, restart = false) {
		if (spawned === amount && !restart) {
			return console.log('All clusters spawned.');
		}

		const worker = cluster.fork();
		// this.clusters.set(worker.id, worker);

		process.nextTick(() => {
			const { firstShardID } = this;
			const lastShardID = (firstShardID + this.shards.max) - 1;
			const maxShards = this.shards.max;

			// expecting { shards, firstShardID, lastShardID, entryPoint, clusterID, clientOptions, token, maxShards }

			if (!options) {
				options = {
					shards: this.shards.max,
					firstShardID,
					entryPoint: this.entryPoint,
					id: worker.id,
					clientOptions: this.clientOptions,
					token: this.token,
					lastShardID,
					maxShards,
				};
				this.clusters.set(worker.id, options);
			}

			worker.send({
				name: 'connect',
				...options,
			});

			if (!restart) {
				this.firstShardID++;
				console.info(`Started worker ${worker.id}`);
			} else {
				console.info('Started new cluster to replace dead cluster.');
			}

			return this.start(amount, spawned + 1);
		});
	}

	async getBotGateway() {
		return (await superagent.get('https://discordapp.com/api/gateway/bot')
			.set('Authorization', this.token)
			.set('User-Agent', this.userAgent)).body;
	}
};
