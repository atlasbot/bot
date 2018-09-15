const Eris = require('eris');
const path = require('path');
const fs = require('fs');

let cooldown = false;

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


			if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
				// start auto reload if we're (probably) in a dev environment
				this.botDir = path.join(path.dirname(this.entryPoint), 'src');
				console.info(`"NODE_ENV" env variable is development or unset, enabling auto-reload on "${this.botDir}" & "${this.entryPoint}".`);
				this.autoReload();
			}
		});

		this.bot.connect();
	}

	autoReload() {
		fs.watch(this.botDir, {
			recursive: true,
		}, this.onChange.bind(this));

		// a bit of a hack to get it to also watch the entry point
		// i mean this is all a bit of a hack but this is especially sketchy
		fs.watchFile(this.entryPoint, {}, () => this.onChange('change', this.entryPoint));
	}

	async onChange(eventType, filename) {
		const loc = path.join('src', filename);
		/*
				on some platforms *cough* windows *cough* fs.watch emits two events for one change
				because windows. so, the cooldown basically means only try to reload every x ms, any other
				events will be ignored to prevent restarting twice for no reason
			*/
		if (cooldown) {
			return;
		}
		cooldown = true;
		setTimeout(() => (cooldown = false), 500); // eslint-disable-line no-return-assign

		const start = new Date();

		console.info(`"${loc}" changed with event type "${eventType}", attempting reloading...`);

		const readyForIt = await this.app.preReload();

		if (!readyForIt) {
			return console.warn('Bot was not ready for a reload, cancelling...');
		}

		this.app = null;
		delete require.cache[require.resolve(this.entryPoint)];

		for (const key in require.cache) { // eslint-disable-line guard-for-in
			const relative = path.relative(this.botDir, key);
			const isSubdir = !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
			if (isSubdir) {
				delete require.cache[key];
			}
		}

		const App = require(this.entryPoint);
		this.app = new App({
			bot: this.bot,
			clusterID: this.clusterID,
		});

		await this.app.launch();

		console.info(`Reloaded bot in ${(new Date() - start)}ms`);
	}
};
