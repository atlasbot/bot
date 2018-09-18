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
				this.watchDirectories = [
					path.join(path.dirname(this.entryPoint), 'src'),
					path.join(path.dirname(this.entryPoint), 'lang'),
					path.join(path.dirname(this.entryPoint), 'lib'),
				];

				this.watchFiles = [
					this.entryPoint,
				];
				// start auto reload if we're (probably) in a dev environment
				console.info('"NODE_ENV" env variable is development or unset, enabling auto-reload for lang/*, src/* and Atlas.js');
				this.autoReload();
			}
		});

		this.bot.connect();
	}

	autoReload() {
		for (const dir of this.watchDirectories) {
			fs.watch(dir, {
				recursive: true,
			}, this.onChange.bind(this));
		}

		for (const file of this.watchFiles) {
			fs.watchFile(file, {}, () => this.onChange('change', file));
		}
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

		if (this.app && this.app.preReload) {
			const readyForIt = await this.app.preReload();

			if (!readyForIt) {
				return console.warn('Bot was not ready for a reload, cancelling...');
			}
		}

		this.app = null;
		// yolo
		for (const p of [...this.watchDirectories, ...this.watchFiles]) {
			delete require.cache[p];
			for (const key in require.cache) { // eslint-disable-line guard-for-in
				const relative = path.relative(p, key);
				const isSubdir = !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
				if (isSubdir) {
					delete require.cache[key];
				}
			}
		}

		const App = require(this.entryPoint);
		this.app = new App({
			bot: this.bot,
			clusterID: this.clusterID,
		});

		await this.app.launch(true);

		console.info(`Reloaded bot in ${(new Date() - start)}ms`);
	}
};
