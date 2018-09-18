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
		const App = require(this.entryPoint);

		this.client = new Eris(this.token, {
			...this.clientOptions,
			autoreconnect: true,
			firstShardID: this.firstShardID,
			lastShardID: this.lastShardID,
			maxShards: this.maxShards,
		});

		this.client.on('ready', async () => {
			this.app = new App({
				client: this.client,
				clusterID: this.clusterID,
			});

			await this.app.launch();


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

		this.client.connect();
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
		// should be noted this is broken as fuck & only intended for development
		const loc = path.join('src', filename);
		/*
			cheap fix for some platforms emitting two events for one change
		*/
		if (cooldown) {
			return;
		}
		cooldown = true;
		setTimeout(() => (cooldown = false), 500); // eslint-disable-line no-return-assign

		const start = new Date();

		console.info(`"${loc}" changed with event type "${eventType}", attempting reloading...`);

		if (this.app && this.app.preReload) {
			try {
				const ready = await this.app.preReload();

				if (!ready) {
					return console.warn('Bot was not ready for a reload, cancelling...');
				}
			} catch (e) {
				console.warn('Could not determine that the bot was ready, reloading... ');
			}
		}

		for (const f of [...this.watchDirectories, ...this.watchFiles]) {
			this.unloadModule(f);
		}

		const App = require(this.entryPoint);
		this.app = new App({
			client: this.client,
			clusterID: this.clusterID,
		});

		await this.app.launch(true);

		console.info(`Reloaded bot in ${(new Date() - start)}ms`);
	}

	unloadModule(name, depth = 0) {
		try {
			const resolved = require.resolve(name);

			if (depth > 15) {
				return;
			}

			const nodeModule = require.cache[resolved];
			if (nodeModule) {
				for (let i = 0; i < nodeModule.children.length; i++) {
					const child = nodeModule.children[i];
					this.unloadModule(child.filename, (depth + 1));
				}
				delete require.cache[resolved];
			}
		} catch (e) {} // eslint-disable-line no-empty
	}
};
